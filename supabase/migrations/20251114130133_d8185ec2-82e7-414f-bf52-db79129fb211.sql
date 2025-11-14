-- Adicionar especialidade na triagem
ALTER TABLE triagens_ia ADD COLUMN IF NOT EXISTS especialidade_recomendada TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_triagens_especialidade ON triagens_ia(especialidade_recomendada);
CREATE INDEX IF NOT EXISTS idx_profissionais_especialidade ON profissionais(especialidade);

-- Atualizar RLS para médicos verem apenas triagens da sua especialidade
DROP POLICY IF EXISTS "Profissionais podem ver todas as triagens" ON triagens_ia;

CREATE POLICY "Profissionais podem ver triagens da sua especialidade"
ON triagens_ia FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'profissional'::app_role) AND
  EXISTS (
    SELECT 1 FROM profissionais p
    WHERE p.profile_id = auth.uid()
    AND (
      p.especialidade = triagens_ia.especialidade_recomendada
      OR triagens_ia.especialidade_recomendada IS NULL
    )
  )
);

-- Adicionar constraint para especialidades válidas
ALTER TABLE profissionais 
DROP CONSTRAINT IF EXISTS profissionais_especialidade_check;

ALTER TABLE profissionais
ADD CONSTRAINT profissionais_especialidade_check 
CHECK (especialidade IN (
  'Clínico Geral',
  'Cardiologia',
  'Dermatologia',
  'Ortopedia',
  'Pediatria',
  'Ginecologia',
  'Psiquiatria',
  'Neurologia',
  'Oftalmologia',
  'Otorrinolaringologia',
  'Urologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Pneumologia',
  'Reumatologia',
  'Oncologia',
  'Nefrologia',
  'Hematologia',
  'Infectologia',
  'Geriatria'
));