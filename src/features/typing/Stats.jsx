export default function Stats({ timeLeft, wpm, accuracy }) {
    return (
      <div className="stats">
        <div>
          <span>Time</span>
          <strong>{timeLeft}s</strong>
        </div>
  
        <div>
          <span>WPM</span>
          <strong>{wpm}</strong>
        </div>
  
        <div>
          <span>Accuracy</span>
          <strong>{accuracy}%</strong>
        </div>
      </div>
    );
  }