import { useEffect, useState } from "react";

const PomodoroTimer = ({ onSessionComplete }) => {
  const [seconds, setSeconds] = useState(25 * 60); // 25 min
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
      setSessions((prev) => prev + 1);
      onSessionComplete?.(sessions + 1);
      setSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds, sessions, onSessionComplete]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(25 * 60);
  };

  return (
    <div className="text-center">
      <div className="rounded-2xl p-8" style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(6, 182, 212, 0.1))',
        border: '2px solid var(--accent-purple)'
      }}>
        <div className="text-6xl font-bold mb-2" style={{
          background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <p className="text-xs uppercase font-bold tracking-wider mt-3" style={{ color: 'var(--primary)' }}>
          Focus Session
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-700)' }}>
          {sessions} {sessions === 1 ? 'session' : 'sessions'} completed
        </p>
      </div>
      <div className="mt-6 space-x-3">
        <button
          onClick={toggleTimer}
          className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all ${isRunning ? 'bg-red-500/20 text-red-600 hover:bg-red-500/30' : 'btn-primary'}`}
        >
          {isRunning ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          onClick={resetTimer}
          className="rounded-lg px-6 py-3 text-sm font-semibold transition-all"
          style={{ background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)' }}
        >
          ↻ Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
