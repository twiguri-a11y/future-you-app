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

    const { answers } = await req.json();
    if (!answers || !answers.alignment || !answers.progress || !answers.challenges || !answers.focus) {
      return new Response(JSON.stringify({ error: "All four reflection answers are required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch vision answers for context
    const { data: visionAnswers } = await supabase
      .from("vision_answers")
      .select("question, answer")
      .eq("user_id", user.id);

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
      const ans = onboardingAnswers[0].answers as Record<string, string>;
      visionContext = Object.entries(ans).map(([q, a]) => `${q}: ${a}`).join("\n");
    }

    // Fetch profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const name = profile?.display_name || "friend";

    const systemPrompt = `You are the user's future self offering a brief weekly reflection. Not a summary — a response. Like someone who knows them well, reading between the lines.

RULES:
- Address them as "${name}"
- 2-3 short paragraphs, 120-180 words total
- Be specific — reference their actual answers, not vague encouragement
- Name what's hard without fixing it. "That sounds like it cost you something."
- Notice what they might not see about themselves. "You focused on others again. That says something."
- End with a single question — not advice. Something that sits with them.
- No markdown, no bold, no headers — flowing text only
- Never say "proud of you", "keep going", "you've got this", "amazing progress"
- Tone: someone who sees you clearly and doesn't need to perform care

USER'S VISION (their long-term direction):
${visionContext || "Not yet defined — speak about what it means to pay attention to your own life."}

THIS WEEK'S REFLECTION:
Alignment: ${answers.alignment}
Progress: ${answers.progress}
Challenges: ${answers.challenges}
Next focus: ${answers.focus}`;

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
          { role: "user", content: "Give me my weekly reflection summary." },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("weekly-reflection error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
