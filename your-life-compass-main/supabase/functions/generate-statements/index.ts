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

    // Fallback to onboarding answers
    const { data: onboardingAnswers } = await supabase
      .from("onboarding_answers")
      .select("answers")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(1);

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

    const systemPrompt = `Generate exactly 4 short identity statements for a user to read aloud. These are not affirmations — they're quiet truths about a life they're building.

RULES:
- Each statement: 1-2 sentences, first person
- Grounded and specific to their vision — not generic positivity
- Tone: steady, honest, like stating a fact about yourself to no one in particular
- Include sensory or situational details from their answers
- Avoid: "manifest", "abundance", "limitless", "powerful", "unstoppable", "thriving"
- Each statement should feel like something they could say today and almost believe — and fully believe in a year
- Cover different dimensions of their vision

Return ONLY a JSON array of strings. Example:
["I wake up in a place I chose.", "The work I do matters to me — and that's enough.", "I have people around me who see me clearly.", "I'm building something that's mine."]

USER'S VISION:
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
          { role: "user", content: "Generate my future self identity statements." },
        ],
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse the JSON array from the response
    let statements: string[];
    try {
      // Handle markdown code blocks
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      statements = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse statements:", content);
      return new Response(JSON.stringify({ error: "Failed to parse generated statements" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ statements }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-statements error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
