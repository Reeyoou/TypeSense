import { useEffect, useMemo, useRef, useState } from "react";
import { WORDS } from "./words";
import Stats from "./Stats";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  calculateStats,
  generateWords,
  getCharacterClassName,
  getTypingMistakes,
} from "./typingUtils";

const TEST_DURATION = 30;

export default function TypingTest() {
  const [words, setWords] = useState(() => generateWords(WORDS));
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [saved, setSaved] = useState(false);

  const { user } = useAuth();

  const inputRef = useRef(null);

  const targetText = useMemo(() => words.join(" "), [words]);

  const stats = calculateStats({
    typed,
    targetText,
    testDuration: TEST_DURATION,
    timeLeft,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!started || finished) return;

    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [started, finished, timeLeft]);

  useEffect(() => {
    if (!finished || saved || !user) return;

    async function saveResult() {
      await saveTypingSession(stats);
      setSaved(true);
    }

    saveResult();
  }, [finished, saved, user]);

  function handleChange(e) {
    if (finished) return;

    const value = e.target.value;

    if (!started) {
      setStarted(true);
    }

    if (value.length <= targetText.length) {
      setTyped(value);
    }
  }

  function restartTest() {
    setWords(generateWords(WORDS));
    setTyped("");
    setStarted(false);
    setFinished(false);
    setSaved(false);
    setTimeLeft(TEST_DURATION);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function saveTypingSession(finalStats) {
    if (!user) return;

    const { data: sessionData, error: sessionError } = await supabase
      .from("typing_sessions")
      .insert({
        user_id: user.id,
        duration_seconds: TEST_DURATION,
        wpm: finalStats.wpm === "--" ? 0 : Number(finalStats.wpm),
        accuracy: Number(finalStats.accuracy),
        correct_chars: finalStats.correctChars,
        incorrect_chars: finalStats.incorrectChars,
        total_chars: typed.length,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error saving typing session:", sessionError.message);
      return;
    }

    const mistakes = getTypingMistakes({
      typed,
      targetText,
    });

    if (mistakes.length === 0) return;

    const mistakesToInsert = mistakes.map((mistake) => ({
      ...mistake,
      session_id: sessionData.id,
      user_id: user.id,
    }));

    const { error: mistakesError } = await supabase
      .from("typing_mistakes")
      .insert(mistakesToInsert);

    if (mistakesError) {
      console.error("Error saving typing mistakes:", mistakesError.message);
    }
  }

  return (
    <main className="typing-page" onClick={() => inputRef.current?.focus()}>
      <div className="top-bar">
        <h1>TypeSense</h1>
        <button onClick={restartTest}>restart</button>
      </div>

      <Stats timeLeft={timeLeft} wpm={stats.wpm} accuracy={stats.accuracy} />

      <section className="typing-box">
        <div className="words">
          {targetText.split("").map((char, index) => (
            <span
              key={index}
              className={getCharacterClassName({
                index,
                char,
                typed,
                finished,
              })}
            >
              {char}
            </span>
          ))}
        </div>

        <input
          ref={inputRef}
          value={typed}
          onChange={handleChange}
          disabled={finished}
          className="hidden-input"
          autoFocus
        />
      </section>

      {finished && (
        <section className="result-card">
          <h2>Result</h2>
          <p>WPM: {stats.wpm}</p>
          <p>Accuracy: {stats.accuracy}%</p>
          <p>Correct characters: {stats.correctChars}</p>
          <p>Incorrect characters: {stats.incorrectChars}</p>
          <button onClick={restartTest}>Try again</button>
        </section>
      )}
    </main>
  );
}
