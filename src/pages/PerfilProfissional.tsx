import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  tipo_usuario: string;
}

interface Profissional {
  id: string;
  profile_id: string;
  especialidade: string;
  crm?: string;
  registro_profissional?: string;
  area_atuacao?: string;
  local_atendimento?: string;
  experiencia?: string;
}

export default function PerfilProfissional() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profissional, setProfissional] = useState<Profissional | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Carregar perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Carregar dados profissionais
      const { data: profData, error: profError } = await supabase
        .from("profissionais")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (profError && profError.code !== 'PGRST116') {
        throw profError;
      }
      
      if (profData) {
        setProfissional(profData);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nome: profile.nome,
          cpf: profile.cpf,
          telefone: profile.telefone,
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      if (profissional) {
        const { error: profError } = await supabase
          .from("profissionais")
          .update({
            especialidade: profissional.especialidade,
            crm: profissional.crm,
            registro_profissional: profissional.registro_profissional,
            area_atuacao: profissional.area_atuacao,
            local_atendimento: profissional.local_atendimento,
            experiencia: profissional.experiencia,
          })
          .eq("id", profissional.id);

        if (profError) throw profError;
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Perfil Profissional</h1>
        </div>

        <Tabs defaultValue="pessoal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="profissional">Dados Profissionais</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="pessoal">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Seus dados cadastrais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={profile.nome}
                      onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" value={profile.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={profile.cpf || ""}
                      onChange={(e) => setProfile({ ...profile, cpf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      placeholder="(00) 00000-0000"
                      value={profile.telefone || ""}
                      onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dados Profissionais */}
          <TabsContent value="profissional">
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
                <CardDescription>Dados da sua atuação médica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profissional ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="especialidade">Especialidade *</Label>
                        <Select
                          value={profissional.especialidade}
                          onValueChange={(value) => setProfissional({ ...profissional, especialidade: value })}
                        >
                          <SelectTrigger>
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
                      <div className="space-y-2">
                        <Label htmlFor="crm">CRM</Label>
                        <Input
                          id="crm"
                          placeholder="Ex: CRM/SP 123456"
                          value={profissional.crm || ""}
                          onChange={(e) => setProfissional({ ...profissional, crm: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registro_profissional">Registro Profissional</Label>
                        <Input
                          id="registro_profissional"
                          value={profissional.registro_profissional || ""}
                          onChange={(e) => setProfissional({ ...profissional, registro_profissional: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area_atuacao">Área de Atuação</Label>
                        <Input
                          id="area_atuacao"
                          placeholder="Ex: Clínica Geral"
                          value={profissional.area_atuacao || ""}
                          onChange={(e) => setProfissional({ ...profissional, area_atuacao: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="local_atendimento">Local de Atendimento</Label>
                      <Input
                        id="local_atendimento"
                        placeholder="Ex: Hospital ABC, Clínica XYZ"
                        value={profissional.local_atendimento || ""}
                        onChange={(e) => setProfissional({ ...profissional, local_atendimento: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experiencia">Experiência e Formação</Label>
                      <Textarea
                        id="experiencia"
                        placeholder="Descreva sua formação acadêmica, especializações e experiência profissional"
                        value={profissional.experiencia || ""}
                        onChange={(e) => setProfissional({ ...profissional, experiencia: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Você ainda não completou seu perfil profissional
                    </p>
                    <Button onClick={() => toast.info("Funcionalidade de criação de perfil em desenvolvimento")}>
                      Completar Perfil
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentos */}
          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Comprobatórios</CardTitle>
                <CardDescription>CRM, diploma e certificados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <Button variant="outline">
                    Selecionar Arquivos
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Documentos Necessários</Label>
                  <div className="space-y-2">
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CRM (obrigatório)</span>
                        <span className="text-xs text-muted-foreground">Não enviado</span>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Diploma (obrigatório)</span>
                        <span className="text-xs text-muted-foreground">Não enviado</span>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Certificados de Especialização</span>
                        <span className="text-xs text-muted-foreground">Opcional</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
