-- Criar tabela de vínculo médico-paciente
CREATE TABLE public.medico_paciente (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_medico uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  id_paciente uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data_vinculo timestamp with time zone NOT NULL DEFAULT now(),
  ativo boolean NOT NULL DEFAULT true,
  UNIQUE(id_medico, id_paciente)
);

-- Criar tabela de mensagens do chat
CREATE TABLE public.chat_mensagens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_paciente uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_medico uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  id_triagem uuid REFERENCES public.triagens_ia(id) ON DELETE SET NULL,
  mensagem text,
  tipo text NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto', 'anexo')),
  arquivo_url text,
  data_envio timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'enviada' CHECK (status IN ('enviada', 'lida')),
  remetente_tipo text NOT NULL CHECK (remetente_tipo IN ('paciente', 'medico')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar campo chat_expira_em na tabela triagens_ia
ALTER TABLE public.triagens_ia 
ADD COLUMN chat_expira_em timestamp with time zone,
ADD COLUMN id_medico_vinculado uuid REFERENCES public.profissionais(id) ON DELETE SET NULL;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.medico_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;

-- RLS para medico_paciente
CREATE POLICY "Pacientes podem ver seus vínculos"
ON public.medico_paciente FOR SELECT
USING (id_paciente = auth.uid());

CREATE POLICY "Médicos podem ver seus vínculos"
ON public.medico_paciente FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profissionais
    WHERE profissionais.id = medico_paciente.id_medico
    AND profissionais.profile_id = auth.uid()
  )
);

CREATE POLICY "Sistema pode criar vínculos"
ON public.medico_paciente FOR INSERT
WITH CHECK (true);

-- RLS para chat_mensagens
CREATE POLICY "Pacientes podem ver mensagens de suas conversas"
ON public.chat_mensagens FOR SELECT
USING (id_paciente = auth.uid());

CREATE POLICY "Médicos podem ver mensagens de suas conversas"
ON public.chat_mensagens FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profissionais
    WHERE profissionais.id = chat_mensagens.id_medico
    AND profissionais.profile_id = auth.uid()
  )
);

CREATE POLICY "Pacientes podem enviar mensagens"
ON public.chat_mensagens FOR INSERT
WITH CHECK (
  id_paciente = auth.uid() AND
  remetente_tipo = 'paciente' AND
  EXISTS (
    SELECT 1 FROM public.triagens_ia
    WHERE triagens_ia.id = chat_mensagens.id_triagem
    AND triagens_ia.usuario_id = auth.uid()
    AND triagens_ia.chat_expira_em > now()
  )
);

CREATE POLICY "Médicos podem enviar mensagens"
ON public.chat_mensagens FOR INSERT
WITH CHECK (
  remetente_tipo = 'medico' AND
  EXISTS (
    SELECT 1 FROM public.profissionais
    WHERE profissionais.id = chat_mensagens.id_medico
    AND profissionais.profile_id = auth.uid()
  )
);

CREATE POLICY "Médicos podem atualizar status das mensagens"
ON public.chat_mensagens FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profissionais
    WHERE profissionais.id = chat_mensagens.id_medico
    AND profissionais.profile_id = auth.uid()
  )
);

-- Criar índices para performance
CREATE INDEX idx_chat_mensagens_paciente ON public.chat_mensagens(id_paciente);
CREATE INDEX idx_chat_mensagens_medico ON public.chat_mensagens(id_medico);
CREATE INDEX idx_chat_mensagens_triagem ON public.chat_mensagens(id_triagem);
CREATE INDEX idx_chat_mensagens_data ON public.chat_mensagens(data_envio DESC);
CREATE INDEX idx_medico_paciente_ativo ON public.medico_paciente(ativo) WHERE ativo = true;

-- Habilitar realtime para mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_mensagens;

-- Criar storage bucket para anexos do chat
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-anexos', 'chat-anexos', false);

-- Políticas de storage para anexos
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-anexos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Usuários podem ver seus próprios anexos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-anexos' AND
  auth.uid() IS NOT NULL
);

-- Função para criar vínculo médico-paciente após triagem
CREATE OR REPLACE FUNCTION public.criar_vinculo_medico_paciente(
  p_id_triagem uuid,
  p_id_paciente uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id_medico uuid;
  v_id_vinculo uuid;
BEGIN
  -- Selecionar médico disponível (aqui pode-se implementar lógica mais complexa)
  -- Por enquanto, pega o primeiro profissional ativo
  SELECT id INTO v_id_medico
  FROM public.profissionais
  WHERE profile_id IN (
    SELECT id FROM public.profiles WHERE ativo = true AND tipo_usuario = 'profissional'
  )
  LIMIT 1;
  
  IF v_id_medico IS NULL THEN
    RAISE EXCEPTION 'Nenhum médico disponível';
  END IF;
  
  -- Criar ou atualizar vínculo
  INSERT INTO public.medico_paciente (id_medico, id_paciente, ativo)
  VALUES (v_id_medico, p_id_paciente, true)
  ON CONFLICT (id_medico, id_paciente) 
  DO UPDATE SET ativo = true, data_vinculo = now()
  RETURNING id INTO v_id_vinculo;
  
  -- Atualizar triagem com médico vinculado e expiração do chat (24h)
  UPDATE public.triagens_ia
  SET 
    id_medico_vinculado = v_id_medico,
    chat_expira_em = now() + interval '24 hours'
  WHERE id = p_id_triagem;
  
  RETURN v_id_vinculo;
END;
$$;