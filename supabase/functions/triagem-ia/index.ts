import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const { sintomas } = await req.json();

    if (!sintomas || sintomas.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Sintomas não fornecidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processando triagem para sintomas:', sintomas);

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente médico especializado em triagem de sintomas. 
            Sua função é analisar os sintomas descritos pelo paciente e fornecer:
            1. Classificação de urgência: leve, moderado, grave ou emergencia
            2. Análise detalhada dos sintomas
            3. Recomendações de ação (procurar atendimento imediato, consultar médico em breve, cuidados domiciliares)
            4. Especialidade médica mais adequada baseada nos sintomas descritos
            
            Especialidades disponíveis:
            - Clínico Geral (sintomas gerais, febres, gripes, check-ups)
            - Cardiologia (coração, pressão, dor no peito, palpitações)
            - Dermatologia (pele, manchas, acne, lesões cutâneas)
            - Ortopedia (ossos, articulações, fraturas, dores musculares)
            - Pediatria (crianças e adolescentes até 18 anos)
            - Ginecologia (saúde feminina, gravidez, menstruação)
            - Psiquiatria (saúde mental, ansiedade, depressão)
            - Neurologia (cérebro, nervos, convulsões, enxaquecas)
            - Oftalmologia (olhos, visão)
            - Otorrinolaringologia (ouvido, nariz, garganta)
            - Urologia (sistema urinário, próstata)
            - Endocrinologia (hormônios, diabetes, tireoide)
            - Gastroenterologia (estômago, intestino, digestão)
            - Pneumologia (pulmões, respiração, asma)
            - Reumatologia (artrite, doenças autoimunes)
            - Oncologia (câncer, tumores)
            - Nefrologia (rins)
            - Hematologia (sangue)
            - Infectologia (infecções, doenças infecciosas)
            - Geriatria (idosos acima de 65 anos)
            
            IMPORTANTE: Analise cuidadosamente os sintomas e recomende a especialidade MAIS ADEQUADA. 
            Não recomende sempre a mesma especialidade.
            Sempre deixe claro que você não substitui uma consulta médica real.
            Forneça informações úteis mas seguras.
            
            Na sua resposta, mencione explicitamente qual especialidade você recomenda.
            
            Responda em português do Brasil, de forma clara e empática.`
          },
          {
            role: 'user',
            content: `Paciente relata os seguintes sintomas: ${sintomas}
            
            Por favor, forneça:
            1. Classificação de urgência (leve/moderado/grave/emergencia)
            2. Análise dos sintomas
            3. Especialidade médica mais adequada para este caso
            4. Recomendações específicas`
          }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Limite de requisições excedido. Por favor, tente novamente em alguns instantes.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Serviço temporariamente indisponível. Entre em contato com o suporte.' 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('Erro na API de IA:', response.status, errorText);
      throw new Error('Erro ao processar triagem');
    }

    const data = await response.json();
    const respostaIA = data.choices[0].message.content;

    console.log('Resposta da IA recebida com sucesso');

    // Extrair classificação do texto da resposta
    let classificacao = 'moderado';
    let especialidade_recomendada = 'Clínico Geral'; // Padrão
    const respostaLower = respostaIA.toLowerCase();
    
    if (respostaLower.includes('emergência') || respostaLower.includes('emergencia') || respostaLower.includes('grave')) {
      if (respostaLower.includes('emergência') || respostaLower.includes('emergencia')) {
        classificacao = 'emergencia';
      } else {
        classificacao = 'grave';
      }
    } else if (respostaLower.includes('leve')) {
      classificacao = 'leve';
    }

    // Determinar especialidade recomendada baseado na resposta da IA e nos sintomas
    const especialidades = [
      { nomes: ['cardiologia', 'cardiologista', 'coração', 'cardíaco', 'cardiaco'], especialidade: 'Cardiologia' },
      { nomes: ['dermatologia', 'dermatologista', 'pele', 'dermat'], especialidade: 'Dermatologia' },
      { nomes: ['ortopedia', 'ortopedista', 'osso', 'articulação', 'ortopéd'], especialidade: 'Ortopedia' },
      { nomes: ['pediatria', 'pediatra', 'criança', 'bebê', 'infantil'], especialidade: 'Pediatria' },
      { nomes: ['ginecologia', 'ginecologista', 'ginecológico', 'gravidez', 'menstruação'], especialidade: 'Ginecologia' },
      { nomes: ['psiquiatria', 'psiquiatra', 'mental', 'ansiedade', 'depressão', 'psiquiát'], especialidade: 'Psiquiatria' },
      { nomes: ['neurologia', 'neurologista', 'neurológico', 'cérebro', 'neuro'], especialidade: 'Neurologia' },
      { nomes: ['oftalmologia', 'oftalmologista', 'olho', 'visão', 'oftalm'], especialidade: 'Oftalmologia' },
      { nomes: ['otorrinolaringologia', 'otorrino', 'ouvido', 'nariz', 'garganta', 'otorr'], especialidade: 'Otorrinolaringologia' },
      { nomes: ['urologia', 'urologista', 'urinário', 'próstata', 'urol'], especialidade: 'Urologia' },
      { nomes: ['endocrinologia', 'endocrinologista', 'hormônio', 'tireoide', 'diabetes', 'endocr'], especialidade: 'Endocrinologia' },
      { nomes: ['gastroenterologia', 'gastro', 'estômago', 'intestino', 'digestivo', 'gastr'], especialidade: 'Gastroenterologia' },
      { nomes: ['pneumologia', 'pneumologista', 'pulmão', 'respiratório', 'pneumo'], especialidade: 'Pneumologia' },
      { nomes: ['reumatologia', 'reumatologista', 'artrite', 'reumat'], especialidade: 'Reumatologia' },
      { nomes: ['oncologia', 'oncologista', 'câncer', 'tumor', 'oncol'], especialidade: 'Oncologia' },
      { nomes: ['nefrologia', 'nefrologista', 'rim', 'renal', 'nefr'], especialidade: 'Nefrologia' },
      { nomes: ['hematologia', 'hematologista', 'sangue', 'hemato'], especialidade: 'Hematologia' },
      { nomes: ['infectologia', 'infectologista', 'infecção', 'infeccio'], especialidade: 'Infectologia' },
      { nomes: ['geriatria', 'geriatra', 'idoso', 'geriát'], especialidade: 'Geriatria' },
    ];

    // Procurar a especialidade mencionada na resposta da IA
    for (const esp of especialidades) {
      if (esp.nomes.some(nome => respostaLower.includes(nome))) {
        especialidade_recomendada = esp.especialidade;
        break;
      }
    }

    return new Response(
      JSON.stringify({
        classificacao,
        resposta_ia: respostaIA,
        especialidade_recomendada,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na função de triagem:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao processar triagem'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
