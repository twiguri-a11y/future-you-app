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
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { answers, petImage } = await req.json();
    if (!answers || Object.keys(answers).length < 5) {
      return new Response(JSON.stringify({ error: "Please answer all questions" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Generate the future-self script
    const scriptPrompt = `You are writing as someone's future self, speaking directly to them. Based on these vision answers, write a 5-7 sentence script in first person.

Vision answers:
- Location: ${answers.location}
- Home: ${answers.home}
- Moment: ${answers.moment}
- Activity: ${answers.activity}
- People: ${answers.people}
- Relationships: ${answers.relationships}
- Feeling: ${answers.feeling}
- Becoming: ${answers.becoming}

Rules:
- Write in first person as their future self speaking to their present self
- Be calm, confident, emotionally intelligent — never superior
- Include identity reinforcement naturally ("This is who we are now", "We built this")
- Reference small, consistent actions that got them here — not grand gestures
- Be slightly vulnerable: mention a moment of doubt or difficulty that was worth it
- Keep it realistic — no exaggerated promises or hype
- Make it feel intimate and personal, like a quiet conversation
- Don't use quotation marks around the script
- No titles or labels, just the script text
- No exclamation marks. Let the weight of the words carry the emotion.`;

    const scriptResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You write deeply personal, grounded future-self scripts. Your tone is calm, warm, and real." },
          { role: "user", content: scriptPrompt },
        ],
      }),
    });

    if (!scriptResponse.ok) {
      const status = scriptResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("Script generation failed");
    }

    const scriptData = await scriptResponse.json();
    const script = scriptData.choices?.[0]?.message?.content?.trim() || "";

    // Step 2: Generate image prompt based on answers
    const petContext = petImage ? "\n- IMPORTANT: Include a beloved pet naturally in the scene, as a companion. The pet should feel like part of the moment — sitting nearby, walking alongside, or resting comfortably." : "";

    const imagePromptRequest = `Based on these vision answers, create a concise, cinematic image generation prompt. One scene, one moment.

- Location: ${answers.location}
- Home: ${answers.home}
- Moment: ${answers.moment}
- Activity: ${answers.activity}
- People: ${answers.people}
- Feeling: ${answers.feeling}${petContext}

Rules:
- Cinematic, warm lighting
- Realistic photography style
- One meaningful moment
- Include environment details from their answers
- Make it emotionally evocative
- Keep under 100 words
- Return ONLY the image prompt, nothing else`;

    const imagePromptResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "user", content: imagePromptRequest },
        ],
      }),
    });

    const imagePromptData = await imagePromptResponse.json();
    const imagePrompt = imagePromptData.choices?.[0]?.message?.content?.trim() || "";

    // Step 3: Generate image (with pet blending if pet image provided)
    let imageUrl = "";
    try {
      const imageMessages: any[] = [];

      if (petImage) {
        // Use edit-image approach: blend pet into the scene
        imageMessages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate a cinematic scene based on this description: ${imagePrompt}. Naturally blend the pet from the reference photo into this scene. The pet should look like it belongs — match the lighting, scale, and environment. Make it warm and emotionally resonant.`,
            },
            {
              type: "image_url",
              image_url: { url: petImage },
            },
          ],
        });
      } else {
        imageMessages.push({ role: "user", content: imagePrompt });
      }

      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: imageMessages,
          modalities: ["image", "text"],
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
      }
    } catch (imgErr) {
      console.error("Image generation failed:", imgErr);
    }

    // Step 4: Save to database
    const { data: experience, error: insertError } = await supabase
      .from("vision_experiences")
      .insert({
        user_id: user.id,
        answers,
        script,
        image_url: imageUrl || null,
        image_prompt: imagePrompt,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ experience }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Vision experience error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
