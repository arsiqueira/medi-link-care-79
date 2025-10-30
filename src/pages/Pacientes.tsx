import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, FileText, Activity } from "lucide-react";
import { toast } from "sonner";

interface Paciente {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  data_nascimento: string | null;
  created_at: string;
}

interface TriagemCount {
  paciente_id: string;
  count: number;
}

export default function Pacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [triagensCount, setTriagensCount] = useState<TriagemCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    try {
      setLoading(true);

      // Carregar lista de pacientes
      const { data: pacientesData, error: pacientesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("tipo_usuario", "paciente")
        .order("created_at", { ascending: false });

      if (pacientesError) throw pacientesError;

      setPacientes(pacientesData || []);

      // Carregar contagem de triagens por paciente
      const { data: triagensData, error: triagensError } = await supabase
        .from("triagens_ia")
        .select("usuario_id");

      if (triagensError) throw triagensError;

      // Contar triagens por paciente
      const counts = (triagensData || []).reduce((acc: TriagemCount[], triagem) => {
        const existing = acc.find(item => item.paciente_id === triagem.usuario_id);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ paciente_id: triagem.usuario_id, count: 1 });
        }
        return acc;
      }, []);

      setTriagensCount(counts);
    } catch (error: any) {
      console.error("Erro ao carregar pacientes:", error);
      toast.error("Erro ao carregar lista de pacientes");
    } finally {
      setLoading(false);
    }
  };

  const getTriagensCount = (pacienteId: string) => {
    const count = triagensCount.find(t => t.paciente_id === pacienteId);
    return count ? count.count : 0;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Não informado";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 to-health-50">
        <div className="animate-pulse text-medical-600">Carregando pacientes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-health-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-medical-600" />
            <h1 className="text-3xl font-bold text-medical-900">Pacientes</h1>
          </div>
          <p className="text-medical-600">
            Visualize e gerencie os dados dos pacientes cadastrados no sistema
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              <User className="h-4 w-4 text-medical-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-900">{pacientes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Triagens Realizadas</CardTitle>
              <Activity className="h-4 w-4 text-health-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-health-900">
                {triagensCount.reduce((acc, curr) => acc + curr.count, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prontuários Ativos</CardTitle>
              <FileText className="h-4 w-4 text-medical-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-900">{pacientes.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>
              Clique em um paciente para visualizar seu prontuário e histórico
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pacientes.length === 0 ? (
              <div className="text-center py-8 text-medical-600">
                Nenhum paciente cadastrado no sistema
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Data de Nascimento</TableHead>
                      <TableHead className="text-center">Triagens</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pacientes.map((paciente) => (
                      <TableRow key={paciente.id} className="cursor-pointer hover:bg-medical-50">
                        <TableCell className="font-medium">{paciente.nome}</TableCell>
                        <TableCell>{paciente.email}</TableCell>
                        <TableCell>{paciente.telefone || "Não informado"}</TableCell>
                        <TableCell>{formatDate(paciente.data_nascimento)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getTriagensCount(paciente.id) > 0 ? "default" : "secondary"}>
                            {getTriagensCount(paciente.id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/prontuario/${paciente.id}`)}
                          >
                            Ver Prontuário
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
