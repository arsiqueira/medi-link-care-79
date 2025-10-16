import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Loader2, Calendar, Activity } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Prontuario {
  id: string;
  historico_medico: string | null;
  alergias: string | null;
  medicamentos_uso: string | null;
  observacoes: string | null;
  updated_at: string;
}

interface Triagem {
  id: string;
  sintomas: string;
  classificacao: string;
  resposta_ia: string;
  created_at: string;
}

const Prontuario = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [triagens, setTriagens] = useState<Triagem[]>([]);
  
  const [historicoMedico, setHistoricoMedico] = useState("");
  const [alergias, setAlergias] = useState("");
  const [medicamentosUso, setMedicamentosUso] = useState("");
  const [observacoes, setObservacoes] = useState("");

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

      // Carregar prontuário
      const { data: prontuarioData, error: prontuarioError } = await supabase
        .from("prontuarios")
        .select("*")
        .eq("paciente_id", user.id)
        .maybeSingle();

      if (prontuarioError && prontuarioError.code !== "PGRST116") {
        throw prontuarioError;
      }

      if (prontuarioData) {
        setProntuario(prontuarioData);
        setHistoricoMedico(prontuarioData.historico_medico || "");
        setAlergias(prontuarioData.alergias || "");
        setMedicamentosUso(prontuarioData.medicamentos_uso || "");
        setObservacoes(prontuarioData.observacoes || "");
      }

      // Carregar histórico de triagens
      const { data: triagensData, error: triagensError } = await supabase
        .from("triagens_ia")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });

      if (triagensError) throw triagensError;

      setTriagens(triagensData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar prontuário");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      if (prontuario) {
        // Atualizar prontuário existente
        const { error } = await supabase
          .from("prontuarios")
          .update({
            historico_medico: historicoMedico,
            alergias: alergias,
            medicamentos_uso: medicamentosUso,
            observacoes: observacoes,
          })
          .eq("id", prontuario.id);

        if (error) throw error;
      } else {
        // Criar novo prontuário
        const { error } = await supabase
          .from("prontuarios")
          .insert({
            paciente_id: user.id,
            historico_medico: historicoMedico,
            alergias: alergias,
            medicamentos_uso: medicamentosUso,
            observacoes: observacoes,
          });

        if (error) throw error;
      }

      toast.success("Prontuário salvo com sucesso!");
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar prontuário:", error);
      toast.error("Erro ao salvar prontuário");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-secondary mx-auto mb-4 flex items-center justify-center shadow-glow">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Meu Prontuário</h1>
          <p className="text-muted-foreground text-lg">
            Gerencie seu histórico médico e consulte triagens anteriores
          </p>
        </div>

        <Tabs defaultValue="prontuario" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="prontuario">Dados Médicos</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Triagens</TabsTrigger>
          </TabsList>

          <TabsContent value="prontuario" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Médico</CardTitle>
                <CardDescription>
                  Registre condições médicas pré-existentes, cirurgias, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ex: Hipertensão controlada desde 2020, cirurgia de apendicite em 2015..."
                  value={historicoMedico}
                  onChange={(e) => setHistoricoMedico(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alergias</CardTitle>
                <CardDescription>
                  Liste todas as alergias conhecidas (medicamentos, alimentos, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ex: Alergia a penicilina, lactose, pólen..."
                  value={alergias}
                  onChange={(e) => setAlergias(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medicamentos em Uso</CardTitle>
                <CardDescription>
                  Medicamentos que você está tomando atualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ex: Losartana 50mg (1x ao dia), Metformina 850mg (2x ao dia)..."
                  value={medicamentosUso}
                  onChange={(e) => setMedicamentosUso(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observações Gerais</CardTitle>
                <CardDescription>
                  Outras informações relevantes para seu acompanhamento médico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ex: Pratico atividade física 3x por semana, dieta vegetariana..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-secondary hover:opacity-90"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Salvar Prontuário
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            {triagens.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Você ainda não realizou nenhuma triagem
                  </p>
                  <Button
                    onClick={() => navigate("/triagem")}
                    className="mt-4 bg-gradient-primary hover:opacity-90"
                  >
                    Fazer Primeira Triagem
                  </Button>
                </CardContent>
              </Card>
            ) : (
              triagens.map((triagem) => (
                <Card key={triagem.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">
                          {format(new Date(triagem.created_at), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={
                          triagem.classificacao === "leve"
                            ? "secondary"
                            : triagem.classificacao === "moderado"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {triagem.classificacao}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                        Sintomas Relatados
                      </h4>
                      <p className="text-foreground">{triagem.sintomas}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                        Análise da IA
                      </h4>
                      <p className="text-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
                        {triagem.resposta_ia}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Prontuario;
