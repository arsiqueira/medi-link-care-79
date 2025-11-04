-- Expandir tabela profiles com novos campos
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS rg text,
ADD COLUMN IF NOT EXISTS sexo text CHECK (sexo IN ('masculino', 'feminino', 'outro', 'prefiro_nao_dizer')),
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS tipo_sanguineo text CHECK (tipo_sanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
ADD COLUMN IF NOT EXISTS alergias text,
ADD COLUMN IF NOT EXISTS condicoes_preexistentes text,
ADD COLUMN IF NOT EXISTS medicamentos_uso_continuo text,
ADD COLUMN IF NOT EXISTS observacoes_medicas text,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Expandir tabela profissionais com novos campos
ALTER TABLE public.profissionais
ADD COLUMN IF NOT EXISTS area_atuacao text,
ADD COLUMN IF NOT EXISTS registro_profissional text,
ADD COLUMN IF NOT EXISTS experiencia text;

-- Renomear campo 'unidade' para 'local_atendimento' se necessário
ALTER TABLE public.profissionais
RENAME COLUMN unidade TO local_atendimento;

-- Criar tabela de voluntários
CREATE TABLE IF NOT EXISTS public.voluntarios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo_ajuda text NOT NULL,
  disponibilidade text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);

-- Habilitar RLS na tabela voluntarios
ALTER TABLE public.voluntarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para voluntarios
CREATE POLICY "Voluntários podem ver seus próprios dados"
ON public.voluntarios
FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Voluntários podem atualizar seus próprios dados"
ON public.voluntarios
FOR UPDATE
USING (profile_id = auth.uid());

CREATE POLICY "Profissionais podem ver voluntários"
ON public.voluntarios
FOR SELECT
USING (has_role(auth.uid(), 'profissional'::app_role));

CREATE POLICY "Pacientes podem ver voluntários disponíveis"
ON public.voluntarios
FOR SELECT
USING (has_role(auth.uid(), 'paciente'::app_role));

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_cidade ON public.profiles(cidade);
CREATE INDEX IF NOT EXISTS idx_profiles_estado ON public.profiles(estado);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON public.profiles(ativo);
CREATE INDEX IF NOT EXISTS idx_voluntarios_profile_id ON public.voluntarios(profile_id);