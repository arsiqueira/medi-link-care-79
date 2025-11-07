import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ChatMedico from "@/components/ChatMedico";

interface TriagemComChat {
  id: string;
  chat_expira_em: string;
  id_medico_vinculado: string;
}

interface Medico {
  especialidade: string;
  profiles: {
    nome: string;
  };
}

export default function ChatPaciente() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [triagem, setTriagem] = useState<TriagemComChat | null>(null);
  const [medico, setMedico] = useState<Medico | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadChatData();
  }, []);

  const loadChatData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUserId(user.id);

    // Buscar última triagem com chat ativo
    const { data: triagemData, error: triagemError } = await supabase
      .from("triagens_ia")
      .select("id, chat_expira_em, id_medico_vinculado")
      .eq("usuario_id", user.id)
      .not("chat_expira_em", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (triagemError || !triagemData) {
      toast({
        title: "Nenhum chat disponível",
        description: "Você ainda não possui um chat ativo com um médico.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setTriagem(triagemData);

    // Buscar dados do médico
    const { data: medicoData, error: medicoError } = await supabase
      .from("profissionais")
      .select("especialidade, profiles(nome)")
      .eq("id", triagemData.id_medico_vinculado)
      .single();

    if (medicoError) {
      console.error("Erro ao carregar médico:", medicoError);
    } else {
      setMedico(medicoData as any);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando chat...</p>
      </div>
    );
  }

  if (!triagem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Chat com Médico</h1>
        </div>

        <ChatMedico
          idTriagem={triagem.id}
          idPaciente={userId}
          idMedico={triagem.id_medico_vinculado}
          chatExpiraEm={triagem.chat_expira_em}
          nomeMedico={medico?.profiles?.nome}
          especialidade={medico?.especialidade}
        />
      </div>
    </div>
  );
}
