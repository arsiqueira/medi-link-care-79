import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupNome, setSignupNome] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupTipo, setSignupTipo] = useState<"paciente" | "profissional" | "voluntario">("paciente");
  const [signupCpf, setSignupCpf] = useState("");
  const [signupTelefone, setSignupTelefone] = useState("");
  const [signupDataNascimento, setSignupDataNascimento] = useState("");
  const [signupEspecialidade, setSignupEspecialidade] = useState("");
  const [signupCodigoSecreto, setSignupCodigoSecreto] = useState("");

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Login realizado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupCodigoSecreto) {
      toast.error("Por favor, digite o código secreto");
      return;
    }

    if (signupCodigoSecreto !== "0000") {
      toast.error("Código secreto incorreto");
      return;
    }

    if (!signupNome || !signupEmail || !signupPassword || !signupCpf || !signupTelefone || !signupDataNascimento) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (signupTipo === "profissional" && !signupEspecialidade) {
      toast.error("Por favor, selecione uma especialidade");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            nome: signupNome,
            tipo_usuario: signupTipo,
            cpf: signupCpf,
            telefone: signupTelefone,
            data_nascimento: signupDataNascimento,
            especialidade: signupEspecialidade,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Cadastro realizado! Você já pode fazer login.");
      }
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">MediLink</CardTitle>
          <CardDescription>
            Acesse sua plataforma de saúde integrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-codigo">Código Secreto *</Label>
                  <Input
                    id="signup-codigo"
                    type="password"
                    placeholder="Digite o código de acesso"
                    value={signupCodigoSecreto}
                    onChange={(e) => setSignupCodigoSecreto(e.target.value)}
                    disabled={loading}
                    required
                    maxLength={4}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    Você precisa do código de acesso para criar uma conta
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-nome">Nome Completo *</Label>
                  <Input
                    id="signup-nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={signupNome}
                    onChange={(e) => setSignupNome(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-cpf">CPF *</Label>
                    <Input
                      id="signup-cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={signupCpf}
                      onChange={(e) => setSignupCpf(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-data-nascimento">Data de Nascimento *</Label>
                    <Input
                      id="signup-data-nascimento"
                      type="date"
                      value={signupDataNascimento}
                      onChange={(e) => setSignupDataNascimento(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-telefone">Telefone *</Label>
                  <Input
                    id="signup-telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={signupTelefone}
                    onChange={(e) => setSignupTelefone(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-tipo">Tipo de Conta *</Label>
                  <Select
                    value={signupTipo}
                    onValueChange={(value) => setSignupTipo(value as "paciente" | "profissional" | "voluntario")}
                    disabled={loading}
                  >
                    <SelectTrigger id="signup-tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paciente">Paciente</SelectItem>
                      <SelectItem value="profissional">Profissional de Saúde</SelectItem>
                      <SelectItem value="voluntario">Voluntário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {signupTipo === "profissional" && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-especialidade">Especialidade *</Label>
                    <Select value={signupEspecialidade} onValueChange={setSignupEspecialidade} disabled={loading}>
                      <SelectTrigger id="signup-especialidade">
                        <SelectValue placeholder="Selecione sua especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clínico Geral">Clínico Geral</SelectItem>
                        <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                        <SelectItem value="Dermatologia">Dermatologia</SelectItem>
                        <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                        <SelectItem value="Pediatria">Pediatria</SelectItem>
                        <SelectItem value="Ginecologia">Ginecologia</SelectItem>
                        <SelectItem value="Psiquiatria">Psiquiatria</SelectItem>
                        <SelectItem value="Neurologia">Neurologia</SelectItem>
                        <SelectItem value="Oftalmologia">Oftalmologia</SelectItem>
                        <SelectItem value="Otorrinolaringologia">Otorrinolaringologia</SelectItem>
                        <SelectItem value="Urologia">Urologia</SelectItem>
                        <SelectItem value="Endocrinologia">Endocrinologia</SelectItem>
                        <SelectItem value="Gastroenterologia">Gastroenterologia</SelectItem>
                        <SelectItem value="Pneumologia">Pneumologia</SelectItem>
                        <SelectItem value="Reumatologia">Reumatologia</SelectItem>
                        <SelectItem value="Oncologia">Oncologia</SelectItem>
                        <SelectItem value="Nefrologia">Nefrologia</SelectItem>
                        <SelectItem value="Hematologia">Hematologia</SelectItem>
                        <SelectItem value="Infectologia">Infectologia</SelectItem>
                        <SelectItem value="Geriatria">Geriatria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-secondary hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
