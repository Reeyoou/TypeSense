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
  
  Based on the user's recent typing sessions and mistakes, return one useful recommendation.
  
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
        return new Response(
          JSON.stringify({ error: "Mistral request failed" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
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