import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Send, Paperclip } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversa {
  id_paciente: string;
  id_triagem: string;
  ultima_mensagem: string;
  data_ultima_mensagem: string;
  mensagens_nao_lidas: number;
  paciente_nome: string;
}

interface Mensagem {
  id: string;
  mensagem: string;
  remetente_tipo: "paciente" | "medico";
  data_envio: string;
  status: "enviada" | "lida";
  arquivo_url?: string;
  tipo: "texto" | "anexo";
}

export default function ChatsMedico() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [medicoId, setMedicoId] = useState<string>("");
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);

  useEffect(() => {
    loadMedicoData();
  }, []);

  useEffect(() => {
    if (medicoId) {
      loadConversas();
    }
  }, [medicoId]);

  useEffect(() => {
    const idPaciente = searchParams.get("paciente");
    if (idPaciente && conversas.length > 0) {
      const conversa = conversas.find((c) => c.id_paciente === idPaciente);
      if (conversa) {
        selecionarConversa(conversa);
      }
    }
  }, [searchParams, conversas]);

  const loadMedicoData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profissionais")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (error || !data) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setMedicoId(data.id);
  };

  const loadConversas = async () => {
    const { data, error } = await supabase
      .from("chat_mensagens")
      .select(`
        id_paciente,
        id_triagem,
        mensagem,
        data_envio,
        status,
        remetente_tipo,
        profiles!chat_mensagens_id_paciente_fkey(nome)
      `)
      .eq("id_medico", medicoId)
      .order("data_envio", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Agrupar por paciente
    const conversasMap = new Map<string, Conversa>();
    
    data.forEach((msg: any) => {
      if (!conversasMap.has(msg.id_paciente)) {
        const naoLidas = data.filter(
          (m: any) =>
            m.id_paciente === msg.id_paciente &&
            m.remetente_tipo === "paciente" &&
            m.status === "enviada"
        ).length;

        conversasMap.set(msg.id_paciente, {
          id_paciente: msg.id_paciente,
          id_triagem: msg.id_triagem,
          ultima_mensagem: msg.mensagem,
          data_ultima_mensagem: msg.data_envio,
          mensagens_nao_lidas: naoLidas,
          paciente_nome: msg.profiles?.nome || "Paciente",
        });
      }
    });

    setConversas(Array.from(conversasMap.values()));
    setLoading(false);
  };

  const selecionarConversa = async (conversa: Conversa) => {
    setConversaSelecionada(conversa);
    setSearchParams({ paciente: conversa.id_paciente });

    const { data, error } = await supabase
      .from("chat_mensagens")
      .select("*")
      .eq("id_triagem", conversa.id_triagem)
      .order("data_envio", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMensagens((data || []) as Mensagem[]);
      
      // Marcar mensagens como lidas
      await supabase
        .from("chat_mensagens")
        .update({ status: "lida" })
        .eq("id_triagem", conversa.id_triagem)
        .eq("remetente_tipo", "paciente")
        .eq("status", "enviada");
    }
  };

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;

    const { error } = await supabase.from("chat_mensagens").insert({
      id_paciente: conversaSelecionada.id_paciente,
      id_medico: medicoId,
      id_triagem: conversaSelecionada.id_triagem,
      mensagem: novaMensagem,
      remetente_tipo: "medico",
      tipo: "texto",
    });

    if (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNovaMensagem("");
      // Recarregar mensagens
      selecionarConversa(conversaSelecionada);
    }
  };

  const conversasFiltradas = conversas.filter((c) =>
    c.paciente_nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Mensagens dos Pacientes</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[700px]">
          {/* Lista de Conversas */}
          <Card className="p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {loading ? (
                  <p className="text-center text-muted-foreground">Carregando...</p>
                ) : conversasFiltradas.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    Nenhuma conversa encontrada
                  </p>
                ) : (
                  conversasFiltradas.map((conversa) => (
                    <Card
                      key={conversa.id_paciente}
                      className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                        conversaSelecionada?.id_paciente === conversa.id_paciente
                          ? "bg-accent"
                          : ""
                      }`}
                      onClick={() => selecionarConversa(conversa)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{conversa.paciente_nome}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversa.ultima_mensagem}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(conversa.data_ultima_mensagem), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        {conversa.mensagens_nao_lidas > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {conversa.mensagens_nao_lidas}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Área de Chat */}
          <Card className="md:col-span-2 flex flex-col">
            {conversaSelecionada ? (
              <>
                <div className="p-4 border-b bg-primary/5">
                  <h3 className="font-semibold text-lg">
                    {conversaSelecionada.paciente_nome}
                  </h3>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {mensagens.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.remetente_tipo === "medico"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.remetente_tipo === "medico"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.tipo === "anexo" && msg.arquivo_url ? (
                            <a
                              href={msg.arquivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              📎 {msg.mensagem}
                            </a>
                          ) : (
                            <p>{msg.mensagem}</p>
                          )}
                          <p className="text-xs mt-1 opacity-70">
                            {formatDistanceToNow(new Date(msg.data_envio), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleEnviarMensagem()}
                    />
                    <Button onClick={handleEnviarMensagem}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Selecione uma conversa para começar
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
