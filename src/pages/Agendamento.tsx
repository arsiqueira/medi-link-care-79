import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Video, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Profissional {
  id: string;
  especialidade: string;
  area_atuacao: string | null;
  profile_id: string;
  profiles: {
    nome: string;
  };
}

interface HorarioDisponivel {
  hora: string;
  disponivel: boolean;
}

export default function Agendamento() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [selectedProfissional, setSelectedProfissional] = useState<string>("");
  const [tipoConsulta, setTipoConsulta] = useState<"presencial" | "online">("presencial");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [selectedHorario, setSelectedHorario] = useState<string>("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    loadProfissionais();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedProfissional) {
      loadHorariosDisponiveis();
    }
  }, [selectedDate, selectedProfissional]);

  const loadProfissionais = async () => {
    try {
      const { data, error } = await supabase
        .from("profissionais")
        .select(`
          id,
          especialidade,
          area_atuacao,
          profile_id,
          profiles!inner (nome)
        `);

      if (error) throw error;
      setProfissionais(data || []);
    } catch (error) {
      console.error("Error loading profissionais:", error);
      toast.error("Erro ao carregar profissionais");
    }
  };

  const loadHorariosDisponiveis = async () => {
    if (!selectedDate || !selectedProfissional) return;

    try {
      const diaSemana = selectedDate.getDay();
      
      const { data: disponibilidade, error } = await supabase
        .from("disponibilidade_profissional")
        .select("hora_inicio, hora_fim")
        .eq("profissional_id", selectedProfissional)
        .eq("dia_semana", diaSemana)
        .eq("ativo", true);

      if (error) throw error;

      if (!disponibilidade || disponibilidade.length === 0) {
        setHorarios([]);
        return;
      }

      // Gerar horários disponíveis em intervalos de 30 minutos
      const horariosDisponiveis: HorarioDisponivel[] = [];
      disponibilidade.forEach(({ hora_inicio, hora_fim }) => {
        const [horaIni, minIni] = hora_inicio.split(':').map(Number);
        const [horaFim, minFim] = hora_fim.split(':').map(Number);
        
        let currentHour = horaIni;
        let currentMin = minIni;
        
        while (currentHour < horaFim || (currentHour === horaFim && currentMin < minFim)) {
          const horarioStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
          horariosDisponiveis.push({
            hora: horarioStr,
            disponivel: true
          });
          
          currentMin += 30;
          if (currentMin >= 60) {
            currentMin = 0;
            currentHour++;
          }
        }
      });

      // Verificar horários já agendados
      const { data: consultasAgendadas } = await supabase
        .from("consultas")
        .select("data_consulta")
        .eq("profissional_id", selectedProfissional)
        .eq("status", "agendada")
        .gte("data_consulta", format(selectedDate, "yyyy-MM-dd"))
        .lt("data_consulta", format(new Date(selectedDate.getTime() + 86400000), "yyyy-MM-dd"));

      if (consultasAgendadas) {
        consultasAgendadas.forEach(consulta => {
          const horaConsulta = new Date(consulta.data_consulta).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const horario = horariosDisponiveis.find(h => h.hora === horaConsulta);
          if (horario) horario.disponivel = false;
        });
      }

      setHorarios(horariosDisponiveis);
    } catch (error) {
      console.error("Error loading horarios:", error);
      toast.error("Erro ao carregar horários disponíveis");
    }
  };

  const handleAgendar = async () => {
    if (!selectedProfissional || !selectedDate || !selectedHorario || !motivo.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const [hora, minuto] = selectedHorario.split(':');
      const dataConsulta = new Date(selectedDate);
      dataConsulta.setHours(parseInt(hora), parseInt(minuto), 0, 0);

      const { error } = await supabase.from("consultas").insert({
        paciente_id: user.id,
        profissional_id: selectedProfissional,
        data_consulta: dataConsulta.toISOString(),
        tipo_consulta: tipoConsulta,
        motivo_consulta: motivo,
        status: "agendada"
      });

      if (error) throw error;

      toast.success("Consulta agendada com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error agendando consulta:", error);
      toast.error("Erro ao agendar consulta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Agendar Consulta</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Consulta</CardTitle>
              <CardDescription>Preencha as informações para agendar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Consulta *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={tipoConsulta === "presencial" ? "default" : "outline"}
                    onClick={() => setTipoConsulta("presencial")}
                    className="w-full"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Presencial
                  </Button>
                  <Button
                    variant={tipoConsulta === "online" ? "default" : "outline"}
                    onClick={() => setTipoConsulta("online")}
                    className="w-full"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Online
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profissional">Profissional *</Label>
                <Select value={selectedProfissional} onValueChange={setSelectedProfissional}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.profiles.nome} - {prof.especialidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo da Consulta *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Descreva o motivo da consulta"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleAgendar} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Agendar Consulta
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Calendário e Horários */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Selecione a Data</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {selectedDate && selectedProfissional && (
              <Card>
                <CardHeader>
                  <CardTitle>Horários Disponíveis</CardTitle>
                  <CardDescription>
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {horarios.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum horário disponível para esta data
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {horarios.map((horario) => (
                        <Button
                          key={horario.hora}
                          variant={selectedHorario === horario.hora ? "default" : "outline"}
                          disabled={!horario.disponivel}
                          onClick={() => setSelectedHorario(horario.hora)}
                          className="w-full"
                        >
                          <Clock className="mr-2 h-3 w-3" />
                          {horario.hora}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
