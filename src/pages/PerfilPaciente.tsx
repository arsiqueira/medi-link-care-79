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
  rg?: string;
  data_nascimento?: string;
  sexo?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo_sanguineo?: string;
  alergias?: string;
  condicoes_preexistentes?: string;
  medicamentos_uso_continuo?: string;
  observacoes_medicas?: string;
}

interface ContatoEmergencia {
  nome: string;
  telefone: string;
  parentesco: string;
}

export default function PerfilPaciente() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contatosEmergencia, setContatosEmergencia] = useState<ContatoEmergencia[]>([
    { nome: "", telefone: "", parentesco: "" }
  ]);

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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
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

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: profile.nome,
          cpf: profile.cpf,
          rg: profile.rg,
          data_nascimento: profile.data_nascimento,
          sexo: profile.sexo,
          telefone: profile.telefone,
          cep: profile.cep,
          endereco: profile.endereco,
          numero: profile.numero,
          bairro: profile.bairro,
          cidade: profile.cidade,
          estado: profile.estado,
          tipo_sanguineo: profile.tipo_sanguineo,
          alergias: profile.alergias,
          condicoes_preexistentes: profile.condicoes_preexistentes,
          medicamentos_uso_continuo: profile.medicamentos_uso_continuo,
          observacoes_medicas: profile.observacoes_medicas,
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const addContatoEmergencia = () => {
    setContatosEmergencia([...contatosEmergencia, { nome: "", telefone: "", parentesco: "" }]);
  };

  const removeContatoEmergencia = (index: number) => {
    setContatosEmergencia(contatosEmergencia.filter((_, i) => i !== index));
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Meu Perfil Completo</h1>
        </div>

        <Tabs defaultValue="pessoal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="medico">Dados Médicos</TabsTrigger>
            <TabsTrigger value="emergencia">Emergência</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="pessoal">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Mantenha seus dados atualizados</CardDescription>
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
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={profile.rg || ""}
                      onChange={(e) => setProfile({ ...profile, rg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={profile.data_nascimento || ""}
                      onChange={(e) => setProfile({ ...profile, data_nascimento: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select
                      value={profile.sexo || ""}
                      onValueChange={(value) => setProfile({ ...profile, sexo: value })}
                    >
                      <SelectTrigger id="sexo">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
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

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Endereço</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={profile.cep || ""}
                        onChange={(e) => setProfile({ ...profile, cep: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={profile.endereco || ""}
                        onChange={(e) => setProfile({ ...profile, endereco: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={profile.numero || ""}
                        onChange={(e) => setProfile({ ...profile, numero: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={profile.bairro || ""}
                        onChange={(e) => setProfile({ ...profile, bairro: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={profile.cidade || ""}
                        onChange={(e) => setProfile({ ...profile, cidade: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        placeholder="UF"
                        maxLength={2}
                        value={profile.estado || ""}
                        onChange={(e) => setProfile({ ...profile, estado: e.target.value.toUpperCase() })}
                      />
                    </div>
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

          {/* Dados Médicos */}
          <TabsContent value="medico">
            <Card>
              <CardHeader>
                <CardTitle>Informações Médicas</CardTitle>
                <CardDescription>Histórico e condições de saúde</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_sanguineo">Tipo Sanguíneo</Label>
                  <Select
                    value={profile.tipo_sanguineo || ""}
                    onValueChange={(value) => setProfile({ ...profile, tipo_sanguineo: value })}
                  >
                    <SelectTrigger id="tipo_sanguineo">
                      <SelectValue placeholder="Selecione seu tipo sanguíneo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alergias">Alergias</Label>
                  <Textarea
                    id="alergias"
                    placeholder="Liste suas alergias (medicamentos, alimentos, etc.)"
                    value={profile.alergias || ""}
                    onChange={(e) => setProfile({ ...profile, alergias: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condicoes_preexistentes">Condições Pré-existentes</Label>
                  <Textarea
                    id="condicoes_preexistentes"
                    placeholder="Doenças crônicas, cirurgias anteriores, etc."
                    value={profile.condicoes_preexistentes || ""}
                    onChange={(e) => setProfile({ ...profile, condicoes_preexistentes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicamentos_uso_continuo">Medicamentos em Uso Contínuo</Label>
                  <Textarea
                    id="medicamentos_uso_continuo"
                    placeholder="Liste os medicamentos que você toma regularmente"
                    value={profile.medicamentos_uso_continuo || ""}
                    onChange={(e) => setProfile({ ...profile, medicamentos_uso_continuo: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes_medicas">Observações Médicas</Label>
                  <Textarea
                    id="observacoes_medicas"
                    placeholder="Outras informações relevantes"
                    value={profile.observacoes_medicas || ""}
                    onChange={(e) => setProfile({ ...profile, observacoes_medicas: e.target.value })}
                    rows={3}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contatos de Emergência */}
          <TabsContent value="emergencia">
            <Card>
              <CardHeader>
                <CardTitle>Contatos de Emergência</CardTitle>
                <CardDescription>Pessoas para contatar em caso de emergência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contatosEmergencia.map((contato, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Contato {index + 1}</h4>
                        {contatosEmergencia.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContatoEmergencia(index)}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input
                            value={contato.nome}
                            onChange={(e) => {
                              const newContatos = [...contatosEmergencia];
                              newContatos[index].nome = e.target.value;
                              setContatosEmergencia(newContatos);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input
                            placeholder="(00) 00000-0000"
                            value={contato.telefone}
                            onChange={(e) => {
                              const newContatos = [...contatosEmergencia];
                              newContatos[index].telefone = e.target.value;
                              setContatosEmergencia(newContatos);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Parentesco</Label>
                          <Input
                            placeholder="Ex: Pai, Mãe, Cônjuge"
                            value={contato.parentesco}
                            onChange={(e) => {
                              const newContatos = [...contatosEmergencia];
                              newContatos[index].parentesco = e.target.value;
                              setContatosEmergencia(newContatos);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button variant="outline" onClick={addContatoEmergencia} className="w-full">
                  Adicionar Contato
                </Button>

                <Button onClick={() => toast.info("Salvamento de contatos em desenvolvimento")} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Contatos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentos */}
          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle>Documentos e Exames</CardTitle>
                <CardDescription>Anexe documentos, exames e receitas</CardDescription>
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
                    Formatos aceitos: PDF, JPG, PNG, DOCX (máx. 10MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Documentos Enviados</Label>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Nenhum documento enviado ainda
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
