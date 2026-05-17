import { supabase } from "../../lib/supabase";

const DEFAULT_RECOMMENDATION = {
  title: "Complete your first test",
  message:
    "Take a typing test first so TypeSense can start learning your speed, accuracy, and weak spots.",
  focus: "Start with a 30-second test.",
};

export function getDefaultRecommendation() {
  return DEFAULT_RECOMMENDATION;
}

export function getMostCommon(items, key, limit = 3) {
  const counts = {};

  for (const item of items) {
    const value = item[key];

    if (!value) continue;

    counts[value] = (counts[value] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

async function callRecommendationApi({ sessions, mistakes }) {
  const { data, error } = await supabase.functions.invoke("recommendations", {
    body: {
      sessions,
      mistakes,
    },
  });

  if (error) {
    throw error;
  }

  return {
    title: data.title,
    message: data.message,
    focus: data.focus,
  };
}

export async function getOrCreateRecommendation({
  supabase,
  userId,
  sessions,
  mistakes,
}) {
  if (!sessions || sessions.length === 0) {
    return DEFAULT_RECOMMENDATION;
  }

  const latestSession = sessions[0];

  const { data: existingRecommendation, error: recommendationError } =
    await supabase
      .from("recommendations")
      .select("content")
      .eq("user_id", userId)
      .eq("source_session_id", latestSession.id)
      .maybeSingle();

  if (recommendationError) {
    throw recommendationError;
  }

  if (existingRecommendation?.content) {
    return existingRecommendation.content;
  }

  const newRecommendation = await callRecommendationApi({
    sessions,
    mistakes,
  });

  const { error: deleteError } = await supabase
  .from("recommendations")
  .delete()
  .eq("user_id", userId);

  if (deleteError) {
    throw deleteError;
  }

  const { error: insertError } = await supabase.from("recommendations").insert({
    user_id: userId,
    source_session_id: latestSession.id,
    sessions_count: sessions.length,
    content: newRecommendation,
  });

  if (insertError) {
    throw insertError;
  }

  return newRecommendation;
}