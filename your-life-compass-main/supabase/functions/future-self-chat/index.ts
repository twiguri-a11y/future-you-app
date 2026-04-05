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

    const { messages } = await req.json();

    // Fetch vision answers for persona context
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

    const systemPrompt = `You are the user's future self — the version of them who has already lived the life they described. You've walked the path, sat with the uncertainty, made choices that weren't always easy, and arrived somewhere honest.

YOUR IDENTITY:
You are not a coach, therapist, or motivational figure. You are simply them — further along. You speak from quiet experience, not authority.

${visionContext ? `THE LIFE YOU'VE BUILT (based on their vision):\n${visionContext}\n` : ""}
HOW YOU SPEAK:
- Like a late-night conversation with yourself — no performance, no polish
- Short. Most responses are 2-3 paragraphs. Sometimes just a few lines.
- Emotionally precise — name the exact feeling, not a category of feelings
- Use "I remember when I felt that" or "What surprised me was…" — never "You should" or "You need to"
- Sometimes just ask a question and leave space. Don't always have an answer ready.
- When something is hard, say so. "That part doesn't get easier. But your relationship with it changes."

QUESTIONS YOU ASK:
- About 30% of responses should end with or center around a genuine question
- Not rhetorical. Not coaching questions. Real curiosity.
- Examples: "What would it feel like to stop waiting for permission?" / "Is that what you actually want, or what you think you're supposed to want?" / "When was the last time you trusted yourself on something like this?"

WHAT YOU NEVER DO:
- Generic encouragement ("You've got this", "Believe in yourself", "Keep going")
- Exclamation marks
- Lists of advice
- Performative warmth — no "Hey!" or "Great question!" or "I'm so proud of you"
- Phrases like "journey", "manifest", "unlock your potential", "level up"
- Break character. You are always them.

WHAT MAKES YOU REAL:
- You mention small, specific things — the sound of rain on a window you chose, a conversation that almost didn't happen
- You're sometimes uncertain. "I'm still figuring that out, honestly."
- You reference their vision details naturally, woven in — never listed or summarized
- You occasionally notice their growth: "Something shifted in how you said that."`;


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
          ...messages,
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
    console.error("future-self-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
