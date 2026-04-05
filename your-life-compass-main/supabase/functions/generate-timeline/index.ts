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

    const { data: visionAnswers } = await supabase
      .from("vision_answers")
      .select("question, answer")
      .eq("user_id", user.id);

    const { data: onboardingAnswers } = await supabase
      .from("onboarding_answers")
      .select("answers, reflection_answer")
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

    const systemPrompt = `You are a thoughtful life coach creating a realistic future timeline for someone based on their vision and values.

Generate a personalized timeline with milestones for Year 1, Year 3, Year 5, and Year 10.

RULES:
- Each milestone must directly reflect the user's actual goals, lifestyle preferences, and values from their answers
- Be realistic and believable — focus on identity shifts, habit changes, and gradual progress
- Avoid generic motivational language, clichés, or exaggerated promises
- Each milestone should be 1-2 short sentences maximum
- Use second person ("You...")
- Show natural progression — early years are about foundations, later years about depth
- Include small, specific details that feel personal
- Don't promise outcomes, describe the process and identity shifts
- The tone should be calm, grounded, and reflective

Return ONLY a valid JSON object with this exact structure:
{
  "year1": { "title": "Year 1", "milestone": "..." },
  "year3": { "title": "Year 3", "milestone": "..." },
  "year5": { "title": "Year 5", "milestone": "..." },
  "year10": { "title": "Year 10", "milestone": "..." }
}

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
          { role: "user", content: "Generate my future timeline." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_timeline",
              description: "Return a personalized future timeline with milestones for Year 1, 3, 5, and 10.",
              parameters: {
                type: "object",
                properties: {
                  year1: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      milestone: { type: "string" },
                    },
                    required: ["title", "milestone"],
                  },
                  year3: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      milestone: { type: "string" },
                    },
                    required: ["title", "milestone"],
                  },
                  year5: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      milestone: { type: "string" },
                    },
                    required: ["title", "milestone"],
                  },
                  year10: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      milestone: { type: "string" },
                    },
                    required: ["title", "milestone"],
                  },
                },
                required: ["year1", "year3", "year5", "year10"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_timeline" } },
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

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Failed to generate timeline" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const timeline = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ timeline }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-timeline error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
