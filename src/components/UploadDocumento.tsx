import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadDocumentoProps {
  pacienteId: string;
  onUploadSuccess: () => void;
}

export default function UploadDocumento({ pacienteId, onUploadSuccess }: UploadDocumentoProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState("exame");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataDocumento, setDataDocumento] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!arquivo || !titulo) {
      toast.error("Preencha o título e selecione um arquivo");
      return;
    }

    setUploading(true);
    try {
      // Fazer upload do arquivo para o storage
      const fileExt = arquivo.name.split('.').pop();
      const fileName = `${pacienteId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('documentos-medicos')
        .upload(fileName, arquivo);

      if (uploadError) throw uploadError;

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('documentos-medicos')
        .getPublicUrl(fileName);

      // Salvar informações do documento no banco
      const { error: dbError } = await (supabase as any)
        .from('documentos_medicos')
        .insert({
          paciente_id: pacienteId,
          tipo_documento: tipoDocumento,
          titulo,
          descricao,
          arquivo_url: publicUrl,
          data_documento: dataDocumento || null,
        });

      if (dbError) throw dbError;

      toast.success("Documento enviado com sucesso!");
      setOpen(false);
      resetForm();
      onUploadSuccess();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar documento");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTipoDocumento("exame");
    setTitulo("");
    setDescricao("");
    setDataDocumento("");
    setArquivo(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Enviar Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Documento Médico</DialogTitle>
          <DialogDescription>
            Faça upload de exames, receitas ou outros documentos médicos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Tipo de Documento *</Label>
            <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exame">Exame</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="atestado">Atestado</SelectItem>
                <SelectItem value="relatorio">Relatório Médico</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Título *</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Exame de Sangue - Hemograma"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Informações adicionais sobre o documento"
            />
          </div>

          <div>
            <Label>Data do Documento</Label>
            <Input
              type="date"
              value={dataDocumento}
              onChange={(e) => setDataDocumento(e.target.value)}
            />
          </div>

          <div>
            <Label>Arquivo * (PDF, Imagem ou Foto)</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.heic"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
            />
            {arquivo && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {arquivo.name}
              </p>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || !arquivo || !titulo}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Documento
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
