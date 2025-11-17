import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Edit, Bell, Pill, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Lembrete {
  id: string;
  nome_medicamento: string;
  dosagem: string | null;
  frequencia: string;
  horarios: string[];
  data_inicio: string;
  data_fim: string | null;
  ativo: boolean;
  observacoes: string | null;
}

interface LembreteConsulta {
  id: string;
  titulo: string;
  data_hora: string;
  descricao: string | null;
  tipo: string;
  completado: boolean;
}

export default function Lembretes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lembretesMedicamento, setLembretesMedicamento] = useState<Lembrete[]>([]);
  const [lembretesConsultas, setLembretesConsultas] = useState<LembreteConsulta[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tipoLembrete, setTipoLembrete] = useState<"medicamento" | "consulta">("medicamento");

  // Form states
  const [nomeMedicamento, setNomeMedicamento] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [frequencia, setFrequencia] = useState("8h");
  const [horarios, setHorarios] = useState<string[]>(["08:00"]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Form states para consulta
  const [tituloConsulta, setTituloConsulta] = useState("");
  const [dataHoraConsulta, setDataHoraConsulta] = useState("");
  const [descricaoConsulta, setDescricaoConsulta] = useState("");

  useEffect(() => {
    loadLembretes();
  }, []);

  const loadLembretes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Carregar lembretes de medicamento
      const { data: medicamentos, error: medError } = await (supabase as any)
        .from("lembretes_medicamento")
        .select("*")
        .eq("paciente_id", user.id)
        .order("created_at", { ascending: false});

      if (medError) throw medError;
      setLembretesMedicamento(medicamentos || []);

      // Carregar lembretes de consulta
      const { data: consultas, error: consError } = await supabase
        .from("lembretes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("data_hora", { ascending: true });

      if (consError) throw consError;
      setLembretesConsultas(consultas || []);
    } catch (error) {
      console.error("Erro ao carregar lembretes:", error);
      toast.error("Erro ao carregar lembretes");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedicamento = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const lembreteData = {
        paciente_id: user.id,
        nome_medicamento: nomeMedicamento,
        dosagem,
        frequencia,
        horarios,
        data_inicio: dataInicio,
        data_fim: dataFim || null,
        observacoes,
        ativo: true,
      };

      if (editingId) {
        const { error } = await (supabase as any)
          .from("lembretes_medicamento")
          .update(lembreteData)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Lembrete atualizado!");
      } else {
        const { error } = await (supabase as any)
          .from("lembretes_medicamento")
          .insert(lembreteData);
        if (error) throw error;
        toast.success("Lembrete criado!");
      }

      resetForm();
      setOpen(false);
      loadLembretes();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar lembrete");
    }
  };

  const handleSaveConsulta = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const lembreteData = {
        usuario_id: user.id,
        titulo: tituloConsulta,
        data_hora: dataHoraConsulta,
        descricao: descricaoConsulta,
        tipo: "consulta",
        completado: false,
      };

      if (editingId) {
        const { error } = await supabase
          .from("lembretes")
          .update(lembreteData)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Lembrete de consulta atualizado!");
      } else {
        const { error } = await supabase
          .from("lembretes")
          .insert(lembreteData);
        if (error) throw error;
        toast.success("Lembrete de consulta criado!");
      }

      resetForm();
      setOpen(false);
      loadLembretes();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar lembrete de consulta");
    }
  };

  const handleDelete = async (id: string, tipo: "medicamento" | "consulta") => {
    try {
      if (tipo === "medicamento") {
        const { error } = await (supabase as any)
          .from("lembretes_medicamento")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lembretes")
          .delete()
          .eq("id", id);
        if (error) throw error;
      }
      toast.success("Lembrete excluído!");
      loadLembretes();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao excluir lembrete");
    }
  };

  const handleEdit = (lembrete: Lembrete | LembreteConsulta, tipo: "medicamento" | "consulta") => {
    setEditingId(lembrete.id);
    setTipoLembrete(tipo);
    
    if (tipo === "medicamento") {
      const med = lembrete as Lembrete;
      setNomeMedicamento(med.nome_medicamento);
      setDosagem(med.dosagem || "");
      setFrequencia(med.frequencia);
      setHorarios(med.horarios);
      setDataInicio(med.data_inicio);
      setDataFim(med.data_fim || "");
      setObservacoes(med.observacoes || "");
    } else {
      const cons = lembrete as LembreteConsulta;
      setTituloConsulta(cons.titulo);
      setDataHoraConsulta(cons.data_hora);
      setDescricaoConsulta(cons.descricao || "");
    }
    
    setOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNomeMedicamento("");
    setDosagem("");
    setFrequencia("8h");
    setHorarios(["08:00"]);
    setDataInicio("");
    setDataFim("");
    setObservacoes("");
    setTituloConsulta("");
    setDataHoraConsulta("");
    setDescricaoConsulta("");
  };

  const addHorario = () => {
    setHorarios([...horarios, "08:00"]);
  };

  const removeHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const updateHorario = (index: number, value: string) => {
    const newHorarios = [...horarios];
    newHorarios[index] = value;
    setHorarios(newHorarios);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando lembretes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Lembretes</h1>
              <p className="text-muted-foreground">Gerencie seus lembretes de medicamentos e consultas</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setTipoLembrete("medicamento"); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lembrete
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Lembrete" : "Novo Lembrete"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do lembrete
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Tipo de Lembrete</Label>
                  <Select value={tipoLembrete} onValueChange={(v) => setTipoLembrete(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medicamento">Medicamento</SelectItem>
                      <SelectItem value="consulta">Consulta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipoLembrete === "medicamento" ? (
                  <>
                    <div>
                      <Label>Nome do Medicamento *</Label>
                      <Input
                        value={nomeMedicamento}
                        onChange={(e) => setNomeMedicamento(e.target.value)}
                        placeholder="Ex: Paracetamol"
                      />
                    </div>

                    <div>
                      <Label>Dosagem</Label>
                      <Input
                        value={dosagem}
                        onChange={(e) => setDosagem(e.target.value)}
                        placeholder="Ex: 500mg"
                      />
                    </div>

                    <div>
                      <Label>Frequência *</Label>
                      <Select value={frequencia} onValueChange={setFrequencia}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4h">A cada 4 horas</SelectItem>
                          <SelectItem value="6h">A cada 6 horas</SelectItem>
                          <SelectItem value="8h">A cada 8 horas</SelectItem>
                          <SelectItem value="12h">A cada 12 horas</SelectItem>
                          <SelectItem value="24h">Uma vez ao dia</SelectItem>
                          <SelectItem value="personalizado">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Horários *</Label>
                      {horarios.map((horario, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            type="time"
                            value={horario}
                            onChange={(e) => updateHorario(index, e.target.value)}
                          />
                          {horarios.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeHorario(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addHorario} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Horário
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data de Início *</Label>
                        <Input
                          type="date"
                          value={dataInicio}
                          onChange={(e) => setDataInicio(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Data de Fim</Label>
                        <Input
                          type="date"
                          value={dataFim}
                          onChange={(e) => setDataFim(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Informações adicionais sobre o medicamento"
                      />
                    </div>

                    <Button onClick={handleSaveMedicamento} className="w-full">
                      {editingId ? "Atualizar" : "Criar"} Lembrete
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Título *</Label>
                      <Input
                        value={tituloConsulta}
                        onChange={(e) => setTituloConsulta(e.target.value)}
                        placeholder="Ex: Consulta com Dr. João"
                      />
                    </div>

                    <div>
                      <Label>Data e Hora *</Label>
                      <Input
                        type="datetime-local"
                        value={dataHoraConsulta}
                        onChange={(e) => setDataHoraConsulta(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={descricaoConsulta}
                        onChange={(e) => setDescricaoConsulta(e.target.value)}
                        placeholder="Informações sobre a consulta"
                      />
                    </div>

                    <Button onClick={handleSaveConsulta} className="w-full">
                      {editingId ? "Atualizar" : "Criar"} Lembrete
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Lembretes de Medicamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medicamentos
              </CardTitle>
              <CardDescription>
                {lembretesMedicamento.length} lembrete(s) de medicamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lembretesMedicamento.map((lembrete) => (
                <Card key={lembrete.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{lembrete.nome_medicamento}</h3>
                        {lembrete.dosagem && (
                          <p className="text-sm text-muted-foreground">{lembrete.dosagem}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(lembrete, "medicamento")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(lembrete.id, "medicamento")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><strong>Frequência:</strong> {lembrete.frequencia}</p>
                      <p><strong>Horários:</strong> {lembrete.horarios.join(", ")}</p>
                      <p><strong>Início:</strong> {format(new Date(lembrete.data_inicio), "dd/MM/yyyy")}</p>
                      {lembrete.data_fim && (
                        <p><strong>Fim:</strong> {format(new Date(lembrete.data_fim), "dd/MM/yyyy")}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {lembretesMedicamento.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum lembrete de medicamento cadastrado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Lembretes de Consultas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Consultas
              </CardTitle>
              <CardDescription>
                {lembretesConsultas.length} lembrete(s) de consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lembretesConsultas.map((lembrete) => (
                <Card key={lembrete.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{lembrete.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(lembrete.data_hora), "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(lembrete, "consulta")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(lembrete.id, "consulta")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {lembrete.descricao && (
                      <p className="text-sm">{lembrete.descricao}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {lembretesConsultas.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum lembrete de consulta cadastrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
