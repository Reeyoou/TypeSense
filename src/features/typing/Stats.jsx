export default function Stats({ timeLeft, wpm, accuracy }) {
    return (
      <div className="stats">
        <div>
          <span>time</span>
          <strong>{timeLeft}s</strong>
        </div>
  
        <div>
          <span>wpm</span>
          <strong>{wpm}</strong>
        </div>
  
        <div>
          <span>accuracy</span>
          <strong>{accuracy}%</strong>
        </div>
      </div>
    );
  }