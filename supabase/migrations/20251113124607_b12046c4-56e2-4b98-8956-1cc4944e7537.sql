-- Adicionar campos necessários na tabela consultas para agendamento
ALTER TABLE public.consultas
ADD COLUMN IF NOT EXISTS status text DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'cancelada', 'realizada')),
ADD COLUMN IF NOT EXISTS tipo_consulta text DEFAULT 'presencial' CHECK (tipo_consulta IN ('presencial', 'online')),
ADD COLUMN IF NOT EXISTS link_video_chamada text,
ADD COLUMN IF NOT EXISTS motivo_consulta text,
ADD COLUMN IF NOT EXISTS duracao_minutos integer DEFAULT 30;

-- Criar índice para buscar consultas por status
CREATE INDEX IF NOT EXISTS idx_consultas_status ON public.consultas(status);
CREATE INDEX IF NOT EXISTS idx_consultas_data ON public.consultas(data_consulta);

-- Criar tabela de disponibilidade dos profissionais
CREATE TABLE IF NOT EXISTS public.disponibilidade_profissional (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  dia_semana integer NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(profissional_id, dia_semana, hora_inicio)
);

-- RLS para disponibilidade_profissional
ALTER TABLE public.disponibilidade_profissional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profissionais podem gerenciar sua disponibilidade"
ON public.disponibilidade_profissional
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profissionais
  WHERE profissionais.id = disponibilidade_profissional.profissional_id
  AND profissionais.profile_id = auth.uid()
));

CREATE POLICY "Pacientes podem ver disponibilidade"
ON public.disponibilidade_profissional
FOR SELECT
USING (ativo = true);

-- Atualizar RLS de consultas para permitir pacientes agendarem
CREATE POLICY "Pacientes podem criar consultas"
ON public.consultas
FOR INSERT
WITH CHECK (paciente_id = auth.uid());

CREATE POLICY "Pacientes podem atualizar suas consultas"
ON public.consultas
FOR UPDATE
USING (paciente_id = auth.uid());

CREATE POLICY "Profissionais podem atualizar consultas"
ON public.consultas
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profissionais
  WHERE profissionais.id = consultas.profissional_id
  AND profissionais.profile_id = auth.uid()
));