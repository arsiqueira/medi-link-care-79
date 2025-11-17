import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertCircle, Bell, Brain, FileText, LogOut, Heart, Users, UserCheck, User, MessageSquare, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import dashboardBg from "@/assets/dashboard-bg.jpg";

interface Profile {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        loadProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">MediLink</h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, {profile?.nome}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div
          className="relative rounded-3xl p-8 mb-8 overflow-hidden"
          style={{
            backgroundImage: `url(${dashboardBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-90" />
          <div className="relative z-10 text-white">
            <h2 className="text-3xl font-bold mb-2">
              Olá, {profile?.nome.split(" ")[0]}! 👋
            </h2>
            <p className="text-lg text-white/90">
              Sua saúde está em boas mãos. Explore os recursos abaixo.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {profile?.tipo_usuario === "paciente" ? (
            <>
              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/triagem")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Triagem com IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Análise inteligente de sintomas
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/medicos")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Médicos</h3>
                    <p className="text-sm text-muted-foreground">
                      Encontre especialistas
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/agendamento")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <CalendarCheck className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Agendar Consulta</h3>
                    <p className="text-sm text-muted-foreground">
                      Marque seu atendimento
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/chat-paciente")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Chat com Médico</h3>
                    <p className="text-sm text-muted-foreground">
                      Converse com seu médico
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/lembretes")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <Bell className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Lembretes</h3>
                    <p className="text-sm text-muted-foreground">
                      Medicamentos e consultas
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/prontuario")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Prontuário</h3>
                    <p className="text-sm text-muted-foreground">
                      Histórico e documentos
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/perfil-paciente")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Meu Perfil</h3>
                    <p className="text-sm text-muted-foreground">
                      Informações pessoais
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // Cards do Profissional
            <>
              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/pacientes")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Pacientes</h3>
                    <p className="text-sm text-muted-foreground">
                      Lista de pacientes
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/chats-medico")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Chats</h3>
                    <p className="text-sm text-muted-foreground">
                      Mensagens de pacientes
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/agenda-medico")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <CalendarCheck className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Agenda</h3>
                    <p className="text-sm text-muted-foreground">
                      Consultas e disponibilidade
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-elegant transition-smooth cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50"
                onClick={() => navigate("/perfil-profissional")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Meu Perfil</h3>
                    <p className="text-sm text-muted-foreground">
                      Dados profissionais
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="text-primary">→</div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
