import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertCircle, Bell, Brain, FileText, LogOut, Heart, Users, UserCheck } from "lucide-react";
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
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 group"
            onClick={() => navigate("/triagem")}
          >
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <CardTitle>Triagem com IA</CardTitle>
              <CardDescription>
                Descreva seus sintomas e receba uma análise inteligente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/50 group"
            onClick={() => navigate("/prontuario")}
          >
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-gradient-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <CardTitle>Meu Prontuário</CardTitle>
              <CardDescription>
                Acesse seu histórico médico e exames
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-error/50 group"
            onClick={() => {
              toast.info("Funcionalidade de emergência em desenvolvimento");
            }}
          >
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-error flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
              <CardTitle>Emergência</CardTitle>
              <CardDescription>
                Acione atendimento de emergência rápido
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-warning/50 group"
            onClick={() => {
              toast.info("Funcionalidade de lembretes em desenvolvimento");
            }}
          >
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-warning flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bell className="h-7 w-7 text-white" />
              </div>
              <CardTitle>Lembretes</CardTitle>
              <CardDescription>
                Configure alertas de medicação e consultas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-info/50 group"
            onClick={() => {
              toast.info("Funcionalidade de monitoramento em desenvolvimento");
            }}
          >
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-info flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <CardTitle>Monitoramento</CardTitle>
              <CardDescription>
                Acompanhe sua evolução de saúde
              </CardDescription>
            </CardHeader>
          </Card>

          {profile?.tipo_usuario === "profissional" && (
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-success/50 group"
              onClick={() => navigate("/pacientes")}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-success flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Meus Pacientes</CardTitle>
                <CardDescription>
                  Visualize e gerencie os dados dos pacientes
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipo de Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold capitalize text-primary">
                {profile?.tipo_usuario}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">Ativo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Última Atualização</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground">Hoje</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
