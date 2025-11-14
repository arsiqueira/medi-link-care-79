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
            
            IMPORTANTE: Sempre deixe claro que você não substitui uma consulta médica real.
            Forneça informações úteis mas seguras.
            
            Responda em português do Brasil, de forma clara e empática.`
          },
          {
            role: 'user',
            content: `Paciente relata os seguintes sintomas: ${sintomas}
            
            Por favor, forneça:
            1. Classificação de urgência (leve/moderado/grave/emergencia)
            2. Análise dos sintomas
            3. Recomendações específicas`
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

    // Determinar especialidade recomendada baseado nos sintomas
    if (respostaLower.includes('coração') || respostaLower.includes('cardíaco') || respostaLower.includes('cardiaco')) {
      especialidade_recomendada = 'Cardiologia';
    } else if (respostaLower.includes('pele') || respostaLower.includes('dermat')) {
      especialidade_recomendada = 'Dermatologia';
    } else if (respostaLower.includes('osso') || respostaLower.includes('articulação') || respostaLower.includes('ortopéd')) {
      especialidade_recomendada = 'Ortopedia';
    } else if (respostaLower.includes('criança') || respostaLower.includes('bebê') || respostaLower.includes('pediatr')) {
      especialidade_recomendada = 'Pediatria';
    } else if (respostaLower.includes('ginecológico') || respostaLower.includes('gravidez') || respostaLower.includes('menstruação')) {
      especialidade_recomendada = 'Ginecologia';
    } else if (respostaLower.includes('mental') || respostaLower.includes('ansiedade') || respostaLower.includes('depressão') || respostaLower.includes('psiquiát')) {
      especialidade_recomendada = 'Psiquiatria';
    } else if (respostaLower.includes('neurológico') || respostaLower.includes('cérebro') || respostaLower.includes('neuro')) {
      especialidade_recomendada = 'Neurologia';
    } else if (respostaLower.includes('olho') || respostaLower.includes('visão') || respostaLower.includes('oftalm')) {
      especialidade_recomendada = 'Oftalmologia';
    } else if (respostaLower.includes('ouvido') || respostaLower.includes('nariz') || respostaLower.includes('garganta') || respostaLower.includes('otorr')) {
      especialidade_recomendada = 'Otorrinolaringologia';
    } else if (respostaLower.includes('urinário') || respostaLower.includes('próstata') || respostaLower.includes('urol')) {
      especialidade_recomendada = 'Urologia';
    } else if (respostaLower.includes('hormônio') || respostaLower.includes('tireoide') || respostaLower.includes('diabetes') || respostaLower.includes('endocr')) {
      especialidade_recomendada = 'Endocrinologia';
    } else if (respostaLower.includes('estômago') || respostaLower.includes('intestino') || respostaLower.includes('digestivo') || respostaLower.includes('gastr')) {
      especialidade_recomendada = 'Gastroenterologia';
    } else if (respostaLower.includes('pulmão') || respostaLower.includes('respiratório') || respostaLower.includes('pneumo')) {
      especialidade_recomendada = 'Pneumologia';
    } else if (respostaLower.includes('artrite') || respostaLower.includes('reumat')) {
      especialidade_recomendada = 'Reumatologia';
    } else if (respostaLower.includes('câncer') || respostaLower.includes('tumor') || respostaLower.includes('oncol')) {
      especialidade_recomendada = 'Oncologia';
    } else if (respostaLower.includes('rim') || respostaLower.includes('renal') || respostaLower.includes('nefr')) {
      especialidade_recomendada = 'Nefrologia';
    } else if (respostaLower.includes('sangue') || respostaLower.includes('hemato')) {
      especialidade_recomendada = 'Hematologia';
    } else if (respostaLower.includes('infecção') || respostaLower.includes('infeccio')) {
      especialidade_recomendada = 'Infectologia';
    } else if (respostaLower.includes('idoso') || respostaLower.includes('geriát')) {
      especialidade_recomendada = 'Geriatria';
    }

    return new Response(
      JSON.stringify({
        classificacao,
        resposta_ia: respostaIA,
        especialidade_recomendada,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

    return new Response(
      JSON.stringify({
        classificacao,
        resposta_ia: respostaIA,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
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
