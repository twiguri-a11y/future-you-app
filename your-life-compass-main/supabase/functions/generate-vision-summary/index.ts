import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json();
    const [idealDay, home, people, feeling] = answers as string[];

    const prompt = `You are generating a deeply personal "future self vision" based on the user's inputs.

Their answers:
1. Ideal day: "${idealDay}"
2. Where they live: "${home}"
3. Who is around them: "${people}"
4. How they feel: "${feeling}"

Write a short, emotionally immersive paragraph.

Style:
- Write in SECOND PERSON ("you")
- Blend present and near-future perspective
- Use sensory details (sounds, textures, environment)
- Keep it grounded and realistic — not fantasy or cliché
- Avoid generic phrases like "everything is perfect", "life is amazing", "living your best life"

Emotional depth:
- Include one emotionally sharp realization that feels deeply personal and slightly uncomfortable
- This should feel like truth, not motivation
- Show contrast between past and present

Structure:
1. Open with a short reflection of the past (1 sentence max)
2. Describe the present moment (2–3 sentences max)
3. End with ONE clear, powerful realization — this MUST be the last sentence

Length & UX constraints (CRITICAL):
- Maximum 5 sentences total
- Maximum 450–600 characters
- Prioritize clarity over detail
- The most powerful sentence MUST be last
- Avoid long or complex sentences
- Make it easy to read on mobile (short, clean lines)

Rules:
- One paragraph only
- No bullet points, no titles, no quotes around the text
- Use the user's own words wherever possible
- Avoid: "happy", "successful", "amazing", "incredible", "beautiful", "manifest", "journey"
- Every sentence must earn its place

Example (for tone only — do not copy):
You used to fill silence with plans that never mattered. Now the kitchen smells like coffee, the dog is on the warm tiles, and the only sound is the ocean. The people here actually know you. You didn't become someone new — you just stopped pretending.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You write deeply personal, grounded vision paragraphs in second person. Max 5 sentences, 450-600 characters. Sensory, honest, slightly uncomfortable truths. The last sentence must be the most powerful. No fluff. Like a quiet moment of clarity." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating vision summary:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
