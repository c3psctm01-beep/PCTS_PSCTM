import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('Server is missing GEMINI_API_KEY')
    }

    const ALLOWED_DEFAULT_MODEL = 'gemini-2.5-flash'
    const LEGACY_INVALID_MODELS = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']

    let { model = ALLOWED_DEFAULT_MODEL, ...payload } = await req.json()
    if (!model || LEGACY_INVALID_MODELS.includes(model)) {
      model = ALLOWED_DEFAULT_MODEL
    }

    const callGemini = async (targetModel: string) => {
      return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    let response = await callGemini(model)
    if (response.status === 404 && model !== 'gemini-2.0-flash') {
      response = await callGemini('gemini-2.0-flash')
    }

    const data = await response.json()

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return new Response(JSON.stringify({ error: data.error?.message || 'Failed to generate content' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
