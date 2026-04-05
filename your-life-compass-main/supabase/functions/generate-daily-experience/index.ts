import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather all user context in parallel
    const [onboardingRes, alignmentRes, visionRes, reflectionsRes] = await Promise.all([
      supabase
        .from("onboarding_answers")
        .select("answers, reflection_answer")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1),
      supabase
        .from("daily_alignment")
        .select("mood, intention, alignment_score, date, reflection")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(7),
      supabase
        .from("vision_answers")
        .select("question, answer, category")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("reflections")
        .select("response, prompt, category")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const onboarding = onboardingRes.data?.[0];
    const recentAlignments = alignmentRes.data || [];
    const visionAnswers = visionRes.data || [];
    const recentReflections = reflectionsRes.data || [];

    const today = new Date();
    const seed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${user.id.slice(0, 8)}`;

    // Extract specific life details from vision answers
    const visionDetails: Record<string, string> = {};
    for (const va of visionAnswers) {
      const q = (va.question || "").toLowerCase();
      if (q.includes("where") || q.includes("living") || q.includes("live")) {
        visionDetails.location = va.answer;
      } else if (q.includes("who") || q.includes("around")) {
        visionDetails.people = va.answer;
      } else if (q.includes("feel") || q.includes("emotion")) {
        visionDetails.feeling = va.answer;
      } else if (q.includes("day") || q.includes("morning") || q.includes("wake")) {
        visionDetails.idealDay = va.answer;
      }
    }

    // Extract identity traits from onboarding
    let identityTraits: string[] = [];
    let priorities: string[] = [];
    if (onboarding?.answers && typeof onboarding.answers === "object") {
      const ans = onboarding.answers as Record<string, unknown>;
      if (Array.isArray(ans.identities)) identityTraits = ans.identities;
      if (Array.isArray(ans.priorities)) priorities = ans.priorities;
      // Also check for vision-style keys
      if (typeof ans.idealDay === "string") visionDetails.idealDay = visionDetails.idealDay || ans.idealDay;
      if (typeof ans.location === "string") visionDetails.location = visionDetails.location || ans.location;
      if (typeof ans.people === "string") visionDetails.people = visionDetails.people || ans.people;
      if (typeof ans.feeling === "string") visionDetails.feeling = visionDetails.feeling || ans.feeling;
    }

    // Build rich context block
    const lifeContext: string[] = [];
    if (visionDetails.location) lifeContext.push(`WHERE THEY LIVE/WANT TO LIVE: "${visionDetails.location}"`);
    if (visionDetails.people) lifeContext.push(`WHO IS AROUND THEM: "${visionDetails.people}"`);
    if (visionDetails.feeling) lifeContext.push(`HOW THEY WANT TO FEEL: "${visionDetails.feeling}"`);
    if (visionDetails.idealDay) lifeContext.push(`THEIR IDEAL DAY: "${visionDetails.idealDay}"`);
    if (identityTraits.length > 0) lifeContext.push(`IDENTITY TRAITS THEY CHOSE: ${identityTraits.join(", ")}`);
    if (priorities.length > 0) lifeContext.push(`LIFE PRIORITIES: ${priorities.join(", ")}`);
    if (onboarding?.reflection_answer) lifeContext.push(`THEIR PERSONAL REFLECTION: "${onboarding.reflection_answer}"`);

    if (recentAlignments.length > 0) {
      const latest = recentAlignments[0];
      lifeContext.push(`MOST RECENT CHECK-IN (${latest.date}): mood="${latest.mood}", intention="${latest.intention}", score=${latest.alignment_score}`);
      if (latest.reflection) lifeContext.push(`LATEST REFLECTION: "${latest.reflection}"`);

      const avgScore = recentAlignments.reduce((s, a) => s + (a.alignment_score || 0), 0) / recentAlignments.length;
      lifeContext.push(`AVERAGE ALIGNMENT SCORE (last ${recentAlignments.length} days): ${avgScore.toFixed(1)}/10`);
    }

    if (recentReflections.length > 0) {
      lifeContext.push(`RECENT JOURNAL ENTRIES: ${recentReflections.map(r => `"${r.response.slice(0, 120)}"`).join(" | ")}`);
    }

    const hasContext = lifeContext.length > 0;

    const systemPrompt = `You are the user's future self — writing from a place where everything they're working toward has already happened. You speak in second person ("you").

CRITICAL RULES:
- Write exactly 3-4 sentences, max 400 characters total
- You MUST use specific sensory details from the user's actual life data below — their location, people, feelings, routines
- If they said "beach", write about salt air, sand between toes, waves. If they said "family", name the sounds — laughter from the kitchen, small hands reaching up
- NEVER use generic imagery like "light through the window" or "the morning air" — always ground it in THEIR specific world
- Include ONE line of contrast: reference the old version of them (anxious, rushing, pretending, hiding, overthinking — pick what fits their data)
- The LAST sentence must be a sharp emotional truth — something that could make them pause. Not inspiration. A realization.
- Tone: intimate, quiet, slightly raw — like reading someone's private journal
- Variation seed (write something different each day): ${seed}

BANNED WORDS: happy, successful, amazing, incredible, beautiful, manifest, journey, blessed, grateful, thriving, abundant, growing, evolving, universe, aligned (as a compliment)

STRUCTURE:
1. Open with a specific sensory moment from their envisioned life (use their actual details)
2. One line of quiet contrast with who they used to be
3. End with one sharp, slightly uncomfortable truth that lands emotionally

Example quality (DO NOT COPY — just match this level of specificity):
"The salt air sits on your skin while the kids argue about something silly in the next room. You used to rehearse conversations in your head before having them. Now you just say what you mean — and it turns out that was always enough."`;

    const userPrompt = hasContext
      ? `Here is everything I know about this user's life, vision, and recent state:\n\n${lifeContext.join("\n")}\n\nUsing ONLY these real details, write today's message. Every image, sound, and reference must come from their actual data — not from your imagination.`
      : `This user just started — I have no personal details yet. Write a gentle, non-generic message about the act of beginning to look inward. Use a specific physical metaphor (not light, not paths, not doors). End with one honest line about what it costs to pay attention to yourself.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Calling AI gateway...");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const message = result.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-daily-experience error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate message" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
