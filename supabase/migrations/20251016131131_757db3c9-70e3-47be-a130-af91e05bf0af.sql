-- Criar tipo enum para tipo de usuário
CREATE TYPE public.tipo_usuario AS ENUM ('paciente', 'profissional', 'familiar', 'voluntario');

-- Criar tipo enum para classificação de triagem
CREATE TYPE public.classificacao_triagem AS ENUM ('leve', 'moderado', 'grave', 'emergencia');

-- Criar tipo enum para status de emergência
CREATE TYPE public.status_emergencia AS ENUM ('ativa', 'em_atendimento', 'resolvida', 'cancelada');

-- Criar tipo enum para role (para sistema de permissões)
CREATE TYPE public.app_role AS ENUM ('admin', 'profissional', 'paciente');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  tipo_usuario tipo_usuario NOT NULL DEFAULT 'paciente',
  foto_url TEXT,
  telefone TEXT,
  data_nascimento DATE,
  cpf TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles (permissões)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tabela de profissionais de saúde
CREATE TABLE public.profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  crm TEXT,
  especialidade TEXT NOT NULL,
  unidade TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de prontuários
CREATE TABLE public.prontuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  historico_medico TEXT,
  alergias TEXT,
  medicamentos_uso TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de consultas
CREATE TABLE public.consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE NOT NULL,
  data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
  diagnostico TEXT,
  prescricao TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de triagens com IA
CREATE TABLE public.triagens_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sintomas TEXT NOT NULL,
  classificacao classificacao_triagem,
  resposta_ia TEXT,
  recomendacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de emergências
CREATE TABLE public.emergencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  localizacao TEXT,
  status status_emergencia NOT NULL DEFAULT 'ativa',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de medicações
CREATE TABLE public.medicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome_medicamento TEXT NOT NULL,
  dosagem TEXT,
  frequencia TEXT NOT NULL,
  horarios TEXT[],
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de lembretes
CREATE TABLE public.lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL, -- 'medicacao', 'consulta', 'exame'
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  completado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triagens_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

-- Função de segurança para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profissionais podem ver perfis de pacientes"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'profissional'));

CREATE POLICY "Admins podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para user_roles
CREATE POLICY "Usuários podem ver suas próprias roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para profissionais
CREATE POLICY "Profissionais podem ver seus próprios dados"
  ON public.profissionais FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Profissionais podem atualizar seus próprios dados"
  ON public.profissionais FOR UPDATE
  USING (profile_id = auth.uid());

-- Políticas RLS para prontuários
CREATE POLICY "Pacientes podem ver seus próprios prontuários"
  ON public.prontuarios FOR SELECT
  USING (paciente_id = auth.uid());

CREATE POLICY "Pacientes podem criar seus próprios prontuários"
  ON public.prontuarios FOR INSERT
  WITH CHECK (paciente_id = auth.uid());

CREATE POLICY "Profissionais podem ver todos os prontuários"
  ON public.prontuarios FOR SELECT
  USING (public.has_role(auth.uid(), 'profissional'));

CREATE POLICY "Profissionais podem atualizar prontuários"
  ON public.prontuarios FOR UPDATE
  USING (public.has_role(auth.uid(), 'profissional'));

-- Políticas RLS para consultas
CREATE POLICY "Pacientes podem ver suas próprias consultas"
  ON public.consultas FOR SELECT
  USING (paciente_id = auth.uid());

CREATE POLICY "Profissionais podem ver consultas"
  ON public.consultas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profissionais
      WHERE profissionais.profile_id = auth.uid()
      AND profissionais.id = consultas.profissional_id
    )
  );

CREATE POLICY "Profissionais podem criar consultas"
  ON public.consultas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profissionais
      WHERE profissionais.profile_id = auth.uid()
    )
  );

-- Políticas RLS para triagens
CREATE POLICY "Usuários podem ver suas próprias triagens"
  ON public.triagens_ia FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem criar suas próprias triagens"
  ON public.triagens_ia FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Profissionais podem ver todas as triagens"
  ON public.triagens_ia FOR SELECT
  USING (public.has_role(auth.uid(), 'profissional'));

-- Políticas RLS para emergências
CREATE POLICY "Usuários podem ver suas próprias emergências"
  ON public.emergencias FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem criar suas próprias emergências"
  ON public.emergencias FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Profissionais podem ver todas as emergências"
  ON public.emergencias FOR SELECT
  USING (public.has_role(auth.uid(), 'profissional'));

CREATE POLICY "Profissionais podem atualizar emergências"
  ON public.emergencias FOR UPDATE
  USING (public.has_role(auth.uid(), 'profissional'));

-- Políticas RLS para medicações
CREATE POLICY "Pacientes podem gerenciar suas próprias medicações"
  ON public.medicacoes FOR ALL
  USING (paciente_id = auth.uid());

CREATE POLICY "Profissionais podem ver medicações"
  ON public.medicacoes FOR SELECT
  USING (public.has_role(auth.uid(), 'profissional'));

-- Políticas RLS para lembretes
CREATE POLICY "Usuários podem gerenciar seus próprios lembretes"
  ON public.lembretes FOR ALL
  USING (usuario_id = auth.uid());

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'tipo_usuario')::tipo_usuario, 'paciente')
  );
  
  -- Atribuir role padrão de paciente
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'paciente');
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prontuarios_updated_at
  BEFORE UPDATE ON public.prontuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergencias_updated_at
  BEFORE UPDATE ON public.emergencias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();