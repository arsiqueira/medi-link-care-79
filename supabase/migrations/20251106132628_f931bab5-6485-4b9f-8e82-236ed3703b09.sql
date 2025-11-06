-- Atualizar função handle_new_user para suportar voluntários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      WHEN NEW.raw_user_meta_data->>'tipo_usuario' = 'voluntario' THEN 'paciente'::app_role
      ELSE 'paciente'::app_role
    END
  );
  
  -- Se for voluntário, criar entrada na tabela voluntarios
  IF NEW.raw_user_meta_data->>'tipo_usuario' = 'voluntario' THEN
    INSERT INTO public.voluntarios (profile_id, tipo_ajuda)
    VALUES (NEW.id, 'geral');
  END IF;
  
  RETURN NEW;
END;
$function$;