import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, MapPin, Building2, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Medico {
  id: string;
  especialidade: string;
  crm: string | null;
  telefone: string | null;
  foto_url: string | null;
  endereco_completo: string | null;
  cidade: string | null;
  estado: string | null;
  tipo_unidade: string | null;
  local_atendimento: string | null;
  profiles: {
    nome: string;
    email: string;
  };
}

const especialidades = [
  "Todas",
  "Cardiologia",
  "Clínico Geral",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia",
  "Neurologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
  "Urologia"
];

const tiposUnidade = [
  "Todas",
  "Clínica",
  "UBS",
  "UPA",
  "Hospital"
];

export default function Medicos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [medicosFiltrados, setMedicosFiltrados] = useState<Medico[]>([]);
  const [busca, setBusca] = useState("");
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState("Todas");
  const [unidadeFiltro, setUnidadeFiltro] = useState("Todas");
  const [cidadeFiltro, setCidadeFiltro] = useState("");

  useEffect(() => {
    loadMedicos();
  }, []);

  useEffect(() => {
    filtrarMedicos();
  }, [busca, especialidadeFiltro, unidadeFiltro, cidadeFiltro, medicos]);

  const loadMedicos = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("profissionais")
        .select(`
          *,
          profiles!inner(nome, email)
        `)
        .eq("ativo", true)
        .order("profiles(nome)");

      if (error) throw error;
      
      setMedicos(data || []);
      setMedicosFiltrados(data || []);
    } catch (error) {
      console.error("Erro ao carregar médicos:", error);
      toast.error("Erro ao carregar lista de médicos");
    } finally {
      setLoading(false);
    }
  };

  const filtrarMedicos = () => {
    let resultado = [...medicos];

    // Filtro por busca (nome ou CRM)
    if (busca) {
      resultado = resultado.filter(
        (m) =>
          m.profiles.nome.toLowerCase().includes(busca.toLowerCase()) ||
          m.crm?.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Filtro por especialidade
    if (especialidadeFiltro !== "Todas") {
      resultado = resultado.filter((m) => m.especialidade === especialidadeFiltro);
    }

    // Filtro por tipo de unidade
    if (unidadeFiltro !== "Todas") {
      resultado = resultado.filter((m) => m.tipo_unidade === unidadeFiltro.toLowerCase());
    }

    // Filtro por cidade
    if (cidadeFiltro) {
      resultado = resultado.filter((m) =>
        m.cidade?.toLowerCase().includes(cidadeFiltro.toLowerCase())
      );
    }

    setMedicosFiltrados(resultado);
  };

  const getTipoUnidadeLabel = (tipo: string | null) => {
    if (!tipo) return "Não especificado";
    return tipo.toUpperCase();
  };

  const getInitials = (nome: string) => {
    const parts = nome.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const handleAgendarConsulta = (medicoId: string) => {
    navigate(`/agendamento?medico=${medicoId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando médicos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Médicos e Especialidades</h1>
            <p className="text-muted-foreground">
              Encontre profissionais de saúde disponíveis
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
            <CardDescription>
              Encontre o profissional ideal para suas necessidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CRM..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={especialidadeFiltro} onValueChange={setEspecialidadeFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={unidadeFiltro} onValueChange={setUnidadeFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Unidade" />
                </SelectTrigger>
                <SelectContent>
                  {tiposUnidade.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Cidade..."
                value={cidadeFiltro}
                onChange={(e) => setCidadeFiltro(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{medicosFiltrados.length}</div>
              <p className="text-sm text-muted-foreground">
                Profissionais encontrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {new Set(medicosFiltrados.map((m) => m.especialidade)).size}
              </div>
              <p className="text-sm text-muted-foreground">
                Especialidades disponíveis
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {new Set(medicosFiltrados.map((m) => m.cidade)).size}
              </div>
              <p className="text-sm text-muted-foreground">Cidades atendidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Médicos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {medicosFiltrados.map((medico) => (
            <Card key={medico.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={medico.foto_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(medico.profiles.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {medico.profiles.nome}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {medico.especialidade}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {medico.crm && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">CRM: {medico.crm}</Badge>
                  </div>
                )}

                {medico.telefone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {medico.telefone}
                  </div>
                )}

                {(medico.cidade || medico.estado) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {medico.cidade}, {medico.estado}
                  </div>
                )}

                {medico.tipo_unidade && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {getTipoUnidadeLabel(medico.tipo_unidade)}
                    {medico.local_atendimento && ` - ${medico.local_atendimento}`}
                  </div>
                )}

                {medico.endereco_completo && (
                  <p className="text-sm text-muted-foreground">
                    {medico.endereco_completo}
                  </p>
                )}

                <Button
                  className="w-full mt-4"
                  onClick={() => handleAgendarConsulta(medico.id)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {medicosFiltrados.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum médico encontrado com os filtros selecionados
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
