import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { Send, Paperclip, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Mensagem {
  id: string;
  mensagem: string;
  remetente_tipo: "paciente" | "medico";
  data_envio: string;
  status: "enviada" | "lida";
  arquivo_url?: string;
  tipo: "texto" | "anexo";
}

interface ChatMedicoProps {
  idTriagem: string;
  idPaciente: string;
  idMedico: string;
  chatExpiraEm: string;
  nomeMedico?: string;
  especialidade?: string;
}

export default function ChatMedico({
  idTriagem,
  idPaciente,
  idMedico,
  chatExpiraEm,
  nomeMedico,
  especialidade,
}: ChatMedicoProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatExpirado, setChatExpirado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMensagens();
    
    // Verificar expiração do chat
    const verificarExpiracao = () => {
      const agora = new Date();
      const expira = new Date(chatExpiraEm);
      
      if (agora > expira) {
        setChatExpirado(true);
        setTempoRestante("expirado");
      } else {
        const diff = expira.getTime() - agora.getTime();
        const horas = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTempoRestante(`${horas}h ${minutos}m`);
      }
    };

    verificarExpiracao();
    const interval = setInterval(verificarExpiracao, 60000); // Atualizar a cada minuto

    // Subscrever ao realtime
    const channel = supabase
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_mensagens',
          filter: `id_triagem=eq.${idTriagem}`,
        },
        (payload) => {
          setMensagens((prev) => [...prev, payload.new as Mensagem]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [idTriagem, chatExpiraEm]);

  const loadMensagens = async () => {
    const { data, error } = await supabase
      .from("chat_mensagens")
      .select("*")
      .eq("id_triagem", idTriagem)
      .order("data_envio", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMensagens((data || []) as Mensagem[]);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim() || chatExpirado) return;

    setLoading(true);
    const { error } = await supabase.from("chat_mensagens").insert({
      id_paciente: idPaciente,
      id_medico: idMedico,
      id_triagem: idTriagem,
      mensagem: novaMensagem,
      remetente_tipo: "paciente",
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
    }
    setLoading(false);
  };

  const handleAnexo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || chatExpirado) return;

    setLoading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${idPaciente}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-anexos")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Erro ao fazer upload",
        description: uploadError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("chat-anexos")
      .getPublicUrl(filePath);

    const { error } = await supabase.from("chat_mensagens").insert({
      id_paciente: idPaciente,
      id_medico: idMedico,
      id_triagem: idTriagem,
      mensagem: `Anexo: ${file.name}`,
      arquivo_url: urlData.publicUrl,
      remetente_tipo: "paciente",
      tipo: "anexo",
    });

    if (error) {
      toast({
        title: "Erro ao enviar anexo",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{nomeMedico || "Dr. Médico"}</h3>
            {especialidade && (
              <p className="text-sm text-muted-foreground">{especialidade}</p>
            )}
          </div>
          {!chatExpirado ? (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Expira em: {tempoRestante}</span>
            </div>
          ) : (
            <div className="text-sm text-destructive font-medium">
              ⏳ Chat expirado
            </div>
          )}
        </div>
      </div>

      {/* Mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.remetente_tipo === "paciente" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.remetente_tipo === "paciente"
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
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      {chatExpirado ? (
        <div className="p-4 border-t bg-muted/50">
          <p className="text-center text-sm text-muted-foreground">
            ⏳ O período de contato com o médico expirou. Caso precise de um novo
            atendimento, realize uma nova triagem.
          </p>
        </div>
      ) : (
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAnexo}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Digite sua mensagem..."
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleEnviarMensagem()}
              disabled={loading}
            />
            <Button onClick={handleEnviarMensagem} disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
