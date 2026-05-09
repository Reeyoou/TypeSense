export function getWordAtIndex(text, charIndex) {
  let start = charIndex;
  let end = charIndex;

  while (start > 0 && text[start - 1] !== " ") {
    start--;
  }

  while (end < text.length && text[end] !== " ") {
    end++;
  }

  return text.slice(start, end);
}

export function getTypingMistakes({ typed, targetText }) {
  const mistakes = [];

  for (let i = 0; i < typed.length; i++) {
    const expectedChar = targetText[i];
    const typedChar = typed[i];

    if (typedChar !== expectedChar) {
      mistakes.push({
        expected_char: expectedChar,
        typed_char: typedChar,
        word: getWordAtIndex(targetText, i),
        char_index: i,
      });
    }
  }

  return mistakes;
}

export function generateWords(wordList, count = 80) {
  return Array.from({ length: count }, () => {
    return wordList[Math.floor(Math.random() * wordList.length)];
  });
}

export function calculateStats({ typed, targetText, testDuration, timeLeft }) {
  let correctChars = 0;
  let incorrectChars = 0;

  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === targetText[i]) {
      correctChars++;
    } else {
      incorrectChars++;
    }
  }

  const elapsedSeconds = testDuration - timeLeft;
  const elapsedMinutes = elapsedSeconds / 60;

  const wpm =
    elapsedSeconds < 3 ? "--" : (correctChars / 5 / elapsedMinutes).toFixed(1);

  const accuracy =
    typed.length === 0
      ? "100.0"
      : ((correctChars / typed.length) * 100).toFixed(1);

  return {
    wpm,
    accuracy,
    correctChars,
    incorrectChars,
  };
}

export function getCharacterClassName({ index, char, typed, finished }) {
  let className = "char";

  if (index < typed.length) {
    className += typed[index] === char ? " correct" : " incorrect";
  }

  if (index === typed.length && !finished) {
    className += " current";
  }

  return className;
}
