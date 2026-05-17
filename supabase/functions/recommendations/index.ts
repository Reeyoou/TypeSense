const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { sessions, mistakes } = await req.json();

    const prompt = `
      You are a typing coach for a typing test app called TypeSense.
      
      Based on the user's recent typing sessions and mistakes, return one useful coaching recommendation.
      
      The mistakes table contains:
      - expected char: the character the user should have typed
      - typed char: the character the user actually typed
      - expected word: the word the user was typing
      - char index: the position of the mistake within the expected word
      
      Do not only describe which keys were wrong. Think about the likely cause of the mistake.
      
      Before writing the recommendation, silently classify the strongest mistake pattern as one of:
      - nearby-key error: the typed key is physically close to the expected key
      - letter-order error: the user typed correct letters but in the wrong order
      - skipped-letter error: the user likely missed a character in the word
      - extra-letter error: the user likely typed an unnecessary character
      - repeated-pattern error: the same mistake pattern appears across multiple words
      - accuracy-speed tradeoff: mistakes increase when speed increases
      
      Use the mistake type only to guide your coaching. Do not include the mistake type as a field in the JSON.
      
      For each mistake, consider:
      - Is the typed char near the expected char on the keyboard?
      - Is the typed char another character from the same expected word near the mistake index? If yes, this may be a letter-order error.
      - Did the mistake happen near the start, middle, or end of the word?
      - Did the same pattern appear across multiple words?
      - Do recent sessions suggest the user is sacrificing accuracy for speed?
      
      Examples:
      - Letter-order error: If the expected word was "power", expected char was "o", typed char was "w", and "w" appears right after "o" in the word, the user may be typing the next letter too early.
      - Nearby-key error: If the expected char was "i" but the typed char was "o", and the expected word does not contain "o" near that index, the user may be reaching to a nearby key by mistake.
      - Start-of-word rushing: If many mistakes happen at char index 0 or 1, the user may be starting words before their fingers are ready.
      - End-of-word rushing: If many mistakes happen near the final characters of words, the user may be moving to the next word too early.
      
      Prefer deeper pattern-based feedback over obvious observations.
      
      Return only valid JSON in this exact shape:
      {
        "title": "Main point",
        "message": "Short explanation of what you noticed",
        "focus": "Specific action the user should take next"
      }
      
      Rules:
      - title should be short
      - message should be friendly and specific
      - focus should be practical and actionable
      - do not include markdown
      - do not include extra text outside the JSON
      - do not mention that you are an AI
      - do not include the mistake type in the returned JSON
      - avoid vague advice like "practice more"
      - focus on one clear pattern only
      - prefer explaining the likely cause of the mistake, not just naming the wrong keys
      
      Recent sessions:
      ${JSON.stringify(sessions, null, 2)}
      
      Recent mistakes:
      ${JSON.stringify(mistakes, null, 2)}
      `;

    const mistralResponse = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("MISTRAL_API_KEY")}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.4,
        }),
      }
    );

    if (!mistralResponse.ok) {
      return new Response(JSON.stringify({ error: "Mistral request failed" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const mistralData = await mistralResponse.json();
    const text = mistralData.choices?.[0]?.message?.content;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "No recommendation returned" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const recommendation = JSON.parse(text);

    return new Response(JSON.stringify(recommendation), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
