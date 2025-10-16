import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Classificacao = "leve" | "moderado" | "grave" | "emergencia";

const Triagem = () => {
  const navigate = useNavigate();
  const [sintomas, setSintomas] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    classificacao: Classificacao;
    resposta_ia: string;
  } | null>(null);

  const getClassificacaoBadge = (classificacao: Classificacao) => {
    const configs = {
      leve: { label: "Leve", variant: "secondary" as const, color: "text-success" },
      moderado: { label: "Moderado", variant: "outline" as const, color: "text-warning" },
      grave: { label: "Grave", variant: "destructive" as const, color: "text-error" },
      emergencia: { label: "Emergência", variant: "destructive" as const, color: "text-error" },
    };

    const config = configs[classificacao];
    return (
      <Badge variant={config.variant} className={`${config.color} text-lg px-4 py-1`}>
        {config.label}
      </Badge>
    );
  };

  const handleTriagem = async () => {
    if (!sintomas.trim()) {
      toast.error("Por favor, descreva seus sintomas");
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const { data, error } = await supabase.functions.invoke("triagem-ia", {
        body: { sintomas },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResultado(data);

      // Salvar triagem no banco
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("triagens_ia").insert({
          usuario_id: user.id,
          sintomas,
          classificacao: data.classificacao,
          resposta_ia: data.resposta_ia,
        });
      }

      toast.success("Triagem realizada com sucesso!");
    } catch (error) {
      console.error("Erro na triagem:", error);
      toast.error("Erro ao processar triagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNovaTriagem = () => {
    setSintomas("");
    setResultado(null);
  };

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center shadow-glow">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Triagem com IA</h1>
          <p className="text-muted-foreground text-lg">
            Descreva seus sintomas e receba uma análise inteligente
          </p>
        </div>

        {!resultado ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Descreva seus sintomas</CardTitle>
              <CardDescription>
                Seja o mais detalhado possível para uma análise precisa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ex: Estou sentindo dor de cabeça intensa há 2 dias, com náuseas e sensibilidade à luz..."
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
                disabled={loading}
                rows={8}
                className="resize-none"
              />
              
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      Aviso Importante
                    </p>
                    <p>
                      Esta triagem é apenas uma orientação preliminar e não substitui 
                      uma consulta médica profissional. Em caso de emergência, procure 
                      atendimento médico imediatamente.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleTriagem}
                disabled={loading || !sintomas.trim()}
                className="w-full bg-gradient-primary hover:opacity-90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando sintomas...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Iniciar Triagem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-lg border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resultado da Triagem</CardTitle>
                  {getClassificacaoBadge(resultado.classificacao)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Sintomas Relatados
                  </h3>
                  <p className="text-muted-foreground bg-muted/50 rounded-lg p-4">
                    {sintomas}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Análise da IA
                  </h3>
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 border border-border">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {resultado.resposta_ia}
                    </p>
                  </div>
                </div>

                {resultado.classificacao === "emergencia" && (
                  <div className="bg-error/10 border-2 border-error rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-error mt-0.5" />
                      <div>
                        <h4 className="font-bold text-error text-lg mb-2">
                          Atenção: Situação de Emergência
                        </h4>
                        <p className="text-foreground">
                          Com base nos sintomas relatados, recomendamos procurar 
                          atendimento médico de emergência imediatamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleNovaTriagem}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Nova Triagem
                  </Button>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 bg-gradient-secondary hover:opacity-90"
                    size="lg"
                  >
                    Voltar ao Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-info/5 border-info">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground text-center">
                  💡 Você pode acessar o histórico de todas as suas triagens na seção 
                  "Meu Prontuário" do dashboard
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Triagem;
