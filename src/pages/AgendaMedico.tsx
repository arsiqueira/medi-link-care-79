import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Video, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Consulta {
  id: string;
  data_consulta: string;
  tipo_consulta: string;
  motivo_consulta: string;
  status: string;
  profiles: {
    nome: string;
  };
}

interface Disponibilidade {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
}

const diasSemana = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado"
];

export default function AgendaMedico() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
  const [profissionalId, setProfissionalId] = useState<string>("");
  
  // Form para nova disponibilidade
  const [novaDiaSemana, setNovaDiaSemana] = useState<string>("");
  const [novaHoraInicio, setNovaHoraInicio] = useState("");
  const [novaHoraFim, setNovaHoraFim] = useState("");
  const [salvandoDisp, setSalvandoDisp] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Buscar ID do profissional
      const { data: profData, error: profError } = await supabase
        .from("profissionais")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (profError) throw profError;
      setProfissionalId(profData.id);

      // Buscar consultas
      const { data: consultasData, error: consultasError } = await supabase
        .from("consultas")
        .select(`
          id,
          data_consulta,
          tipo_consulta,
          motivo_consulta,
          status,
          profiles!consultas_paciente_id_fkey (nome)
        `)
        .eq("profissional_id", profData.id)
        .order("data_consulta", { ascending: true });

      if (consultasError) throw consultasError;
      setConsultas(consultasData || []);

      // Buscar disponibilidades
      const { data: dispData, error: dispError } = await supabase
        .from("disponibilidade_profissional")
        .select("*")
        .eq("profissional_id", profData.id)
        .order("dia_semana", { ascending: true });

      if (dispError) throw dispError;
      setDisponibilidades(dispData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarDisponibilidade = async () => {
    if (!novaDiaSemana || !novaHoraInicio || !novaHoraFim) {
      toast.error("Preencha todos os campos");
      return;
    }

    setSalvandoDisp(true);
    try {
      const { error } = await supabase
        .from("disponibilidade_profissional")
        .insert({
          profissional_id: profissionalId,
          dia_semana: parseInt(novaDiaSemana),
          hora_inicio: novaHoraInicio,
          hora_fim: novaHoraFim,
          ativo: true
        });

      if (error) throw error;

      toast.success("Disponibilidade adicionada!");
      setNovaDiaSemana("");
      setNovaHoraInicio("");
      setNovaHoraFim("");
      loadData();
    } catch (error) {
      console.error("Error adding disponibilidade:", error);
      toast.error("Erro ao adicionar disponibilidade");
    } finally {
      setSalvandoDisp(false);
    }
  };

  const handleRemoverDisponibilidade = async (id: string) => {
    try {
      const { error } = await supabase
        .from("disponibilidade_profissional")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Disponibilidade removida!");
      loadData();
    } catch (error) {
      console.error("Error removing disponibilidade:", error);
      toast.error("Erro ao remover disponibilidade");
    }
  };

  const handleAtualizarStatus = async (consultaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from("consultas")
        .update({ status: novoStatus })
        .eq("id", consultaId);

      if (error) throw error;

      toast.success("Status atualizado!");
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada": return "bg-blue-500";
      case "confirmada": return "bg-green-500";
      case "realizada": return "bg-gray-500";
      case "cancelada": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Minha Agenda</h1>
        </div>

        <Tabs defaultValue="consultas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="consultas">Consultas Agendadas</TabsTrigger>
            <TabsTrigger value="disponibilidade">Disponibilidade</TabsTrigger>
          </TabsList>

          {/* Consultas */}
          <TabsContent value="consultas">
            <div className="space-y-4">
              {consultas.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma consulta agendada</p>
                  </CardContent>
                </Card>
              ) : (
                consultas.map((consulta) => (
                  <Card key={consulta.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{consulta.profiles.nome}</CardTitle>
                          <CardDescription className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(consulta.data_consulta), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {format(new Date(consulta.data_consulta), "HH:mm")}
                            </div>
                            <div className="flex items-center gap-2">
                              {consulta.tipo_consulta === "online" ? (
                                <><Video className="h-4 w-4" /> Consulta Online</>
                              ) : (
                                <><MapPin className="h-4 w-4" /> Consulta Presencial</>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(consulta.status)}>
                          {consulta.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold">Motivo:</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {consulta.motivo_consulta}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {consulta.status === "agendada" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAtualizarStatus(consulta.id, "confirmada")}
                              >
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAtualizarStatus(consulta.id, "cancelada")}
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                          {consulta.status === "confirmada" && (
                            <Button
                              size="sm"
                              onClick={() => handleAtualizarStatus(consulta.id, "realizada")}
                            >
                              Marcar como Realizada
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Disponibilidade */}
          <TabsContent value="disponibilidade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Horário</CardTitle>
                <CardDescription>Configure seus horários de atendimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Dia da Semana *</Label>
                    <Select value={novaDiaSemana} onValueChange={setNovaDiaSemana}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {diasSemana.map((dia, index) => (
                          index !== 0 && (
                            <SelectItem key={index} value={String(index)}>
                              {dia}
                            </SelectItem>
                          )
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hora Início *</Label>
                    <Input
                      type="time"
                      value={novaHoraInicio}
                      onChange={(e) => setNovaHoraInicio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora Fim *</Label>
                    <Input
                      type="time"
                      value={novaHoraFim}
                      onChange={(e) => setNovaHoraFim(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAdicionarDisponibilidade} disabled={salvandoDisp}>
                  {salvandoDisp ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Adicionar Horário</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horários Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                {disponibilidades.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum horário cadastrado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {disponibilidades.map((disp) => (
                      <div key={disp.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{diasSemana[disp.dia_semana]}</p>
                          <p className="text-sm text-muted-foreground">
                            {disp.hora_inicio} - {disp.hora_fim}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoverDisponibilidade(disp.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
