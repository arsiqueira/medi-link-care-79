import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Brain, Heart, Shield, Users, Zap, AlertCircle, FileText, Bell, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-medical.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Sua Saúde,{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Conectada
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                MediLink é a plataforma completa que integra pacientes, profissionais de saúde 
                e serviços de emergência em um único ecossistema digital inteligente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 shadow-glow">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/#como-funciona">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Saiba Mais
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  <span className="text-sm text-muted-foreground">100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-info" />
                  <span className="text-sm text-muted-foreground">+10.000 Usuários</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl" />
              <img
                src={heroImage}
                alt="Equipe médica profissional"
                className="relative rounded-2xl shadow-xl w-full h-auto animate-fade-in"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Recursos Principais</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para cuidar da sua saúde de forma completa e integrada
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Triagem com IA</h3>
                <p className="text-muted-foreground">
                  Sistema inteligente analisa seus sintomas e classifica a urgência do atendimento, 
                  fornecendo orientações precisas.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/50">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Prontuário Eletrônico</h3>
                <p className="text-muted-foreground">
                  Histórico médico completo, exames e consultas em um só lugar, 
                  acessível a você e seus profissionais de saúde.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-error/50">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 rounded-lg bg-error flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Botão de Emergência</h3>
                <p className="text-muted-foreground">
                  Acione atendimento de emergência com um clique, enviando sua localização 
                  e alertando contatos automaticamente.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-warning/50">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 rounded-lg bg-warning flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Lembretes Inteligentes</h3>
                <p className="text-muted-foreground">
                  Nunca mais esqueça de tomar medicamentos ou ir às consultas com 
                  nosso sistema de notificações personalizadas.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-info/50">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 rounded-lg bg-info flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Monitoramento Contínuo</h3>
                <p className="text-muted-foreground">
                  Acompanhe sua evolução de saúde com gráficos e relatórios detalhados 
                  sobre medicações e exames.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-success/50">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 rounded-lg bg-success flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Segurança Total</h3>
                <p className="text-muted-foreground">
                  Seus dados protegidos com criptografia de ponta e conformidade 
                  com todas as normas de privacidade médica.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simples, rápido e eficiente - comece a usar em minutos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-glow">
                1
              </div>
              <h3 className="text-xl font-semibold">Crie sua Conta</h3>
              <p className="text-muted-foreground">
                Cadastre-se gratuitamente e complete seu perfil de saúde com informações básicas
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-secondary mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-glow">
                2
              </div>
              <h3 className="text-xl font-semibold">Configure seu Perfil</h3>
              <p className="text-muted-foreground">
                Adicione histórico médico, medicações atuais e contatos de emergência
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-accent mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-glow">
                3
              </div>
              <h3 className="text-xl font-semibold">Comece a Usar</h3>
              <p className="text-muted-foreground">
                Acesse triagem com IA, agende consultas e monitore sua saúde 24/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">Sobre o MediLink</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              O MediLink nasceu da visão de democratizar o acesso à saúde de qualidade através da tecnologia. 
              Nossa plataforma conecta pacientes, profissionais de saúde e serviços de emergência em um 
              ecossistema integrado e inteligente.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Com recursos como triagem por IA, prontuário eletrônico unificado e botão de emergência, 
              estamos transformando a forma como as pessoas cuidam da sua saúde e acessam serviços médicos.
            </p>
            <div className="grid md:grid-cols-3 gap-8 pt-8">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">10k+</div>
                <div className="text-muted-foreground">Usuários Ativos</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-secondary">500+</div>
                <div className="text-muted-foreground">Profissionais</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-accent">99.9%</div>
                <div className="text-muted-foreground">Disponibilidade</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-primary rounded-3xl p-12 text-center shadow-xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Pronto para Transformar sua Saúde?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já confiam no MediLink para cuidar da sua saúde
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 shadow-lg hover:scale-105 transition-transform">
                Começar Agora - É Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">MediLink</span>
            </div>
            <p className="text-muted-foreground text-center">
              © 2025 MediLink. Todos os direitos reservados. Plataforma de saúde digital.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Termos
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
