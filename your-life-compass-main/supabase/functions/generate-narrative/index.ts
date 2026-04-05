import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch vision answers
    const { data: visionAnswers } = await supabase
      .from("vision_answers")
      .select("question, answer")
      .eq("user_id", user.id);

    // Fetch onboarding answers as fallback
    const { data: onboardingAnswers } = await supabase
      .from("onboarding_answers")
      .select("answers, reflection_answer")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(1);

    // Build context from available answers
    let visionContext = "";
    if (visionAnswers && visionAnswers.length > 0) {
      visionContext = visionAnswers.map((a: any) => `${a.question}: ${a.answer}`).join("\n");
    } else if (onboardingAnswers && onboardingAnswers.length > 0) {
      const answers = onboardingAnswers[0].answers as Record<string, string>;
      visionContext = Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join("\n");
    }

    if (!visionContext) {
      return new Response(JSON.stringify({ error: "No vision answers found. Complete the Vision Builder first." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Write a quiet, grounded "day in the life" story set 5–10 years in the future for the user. Based on their vision answers below.

RULES:
- Three sections: **Morning**, **Midday**, **Evening**
- Second person ("You wake up…")
- Specific and sensory — textures, sounds, light, temperature
- This is a real Tuesday, not a dream sequence. Include friction: a tricky email, a moment of tiredness, a small doubt that passes
- No motivational language. No "living your dream" or "thriving." Just a person in a life they built.
- People feel real — a name, a habit, a way they laugh
- Each section: 2-3 short paragraphs
- Start directly with the morning. No preamble, no title, no introduction.
- The overall feeling should be: "This is actually possible."

USER'S VISION ANSWERS:
${visionContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Write my future day narrative." },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-narrative error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
