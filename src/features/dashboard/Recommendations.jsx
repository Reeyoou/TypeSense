function getAverage(items, key) {
  if (items.length === 0) return 0;

  return items.reduce((sum, item) => sum + Number(item[key]), 0) / items.length;
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

function getTrend(sessions, key) {
  if (sessions.length < 6) return "not_enough_data";

  const recent = sessions.slice(0, 3);
  const previous = sessions.slice(3, 6);

  const recentAverage = getAverage(recent, key);
  const previousAverage = getAverage(previous, key);

  if (recentAverage > previousAverage + 3) return "improving";
  if (recentAverage < previousAverage - 3) return "declining";

  return "stable";
}

export function getRecommendation(sessions, mistakes = []) {
  if (sessions.length === 0) {
    return {
      title: "Complete your first test",
      message:
        "Take a typing test first so TypeSense can start learning your speed, accuracy, and weak spots.",
      focus: "Start with a 30-second test.",
    };
  }

  const recentSessions = sessions.slice(0, 5);

  const averageWpm = getAverage(recentSessions, "wpm");
  const averageAccuracy = getAverage(recentSessions, "accuracy");

  const wpmTrend = getTrend(sessions, "wpm");
  const accuracyTrend = getTrend(sessions, "accuracy");

  const commonWrongLetters = getMostCommon(mistakes, "expected_char", 3);
  const weakWords = getMostCommon(mistakes, "word", 3);

  if (averageAccuracy < 90) {
    return {
      title: "Prioritize accuracy",
      message: `Your recent accuracy is ${averageAccuracy.toFixed(
        1
      )}%. Slow down and aim for clean typing before increasing speed.`,
      focus: "Try to keep accuracy above 95% for your next few tests.",
    };
  }

  if (accuracyTrend === "declining") {
    return {
      title: "Accuracy is slipping",
      message:
        "Your recent accuracy is lower than your previous tests. This usually means you are pushing speed too hard.",
      focus: "Do one slower test and focus on avoiding mistakes.",
    };
  }

  if (wpmTrend === "declining") {
    return {
      title: "Speed has dipped",
      message:
        "Your recent WPM is lower than your previous tests. This can happen when rhythm breaks or accuracy becomes the focus.",
      focus: "Try a short 30-second test to rebuild rhythm.",
    };
  }

  if (commonWrongLetters.length > 0) {
    const letters = commonWrongLetters
      .map((item) => `"${item.value}"`)
      .join(", ");

    return {
      title: "Practice weak letters",
      message: `Your most common missed letters are ${letters}. These are good targets for focused practice.`,
      focus: "Do a slower test and watch those letters carefully.",
    };
  }

  if (weakWords.length > 0) {
    const words = weakWords.map((item) => `"${item.value}"`).join(", ");

    return {
      title: "Practice weak words",
      message: `You have made repeated mistakes on ${words}. Practicing these words can improve consistency.`,
      focus: "Repeat these words slowly before doing another test.",
    };
  }

  if (averageWpm < 40) {
    return {
      title: "Build base speed",
      message: `Your recent average speed is ${averageWpm.toFixed(
        1
      )} WPM. Focus on common words and steady rhythm.`,
      focus: "Do several short tests instead of one long test.",
    };
  }

  if (averageWpm >= 80 && averageAccuracy >= 95) {
    return {
      title: "Increase difficulty",
      message:
        "Your speed and accuracy are both strong. You are ready for harder practice.",
      focus: "Try punctuation, numbers, or longer tests.",
    };
  }

  return {
    title: "Keep building consistency",
    message: `Your recent average is ${averageWpm.toFixed(
      1
    )} WPM with ${averageAccuracy.toFixed(1)}% accuracy.`,
    focus: "Keep doing short, consistent practice sessions.",
  };
}