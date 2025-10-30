-- Corrigir o trigger para criar roles baseado no tipo_usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, nome, email, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'tipo_usuario')::tipo_usuario, 'paciente')
  );
  
  -- Criar role baseado no tipo_usuario
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.raw_user_meta_data->>'tipo_usuario' = 'profissional' THEN 'profissional'::app_role
      ELSE 'paciente'::app_role
    END
  );
  
  RETURN NEW;
END;
$$;

-- Corrigir os registros existentes na tabela user_roles
DELETE FROM public.user_roles;

-- Recriar os registros corretos baseado no tipo_usuario da tabela profiles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE 
    WHEN tipo_usuario = 'profissional' THEN 'profissional'::app_role
    ELSE 'paciente'::app_role
  END
FROM public.profiles;