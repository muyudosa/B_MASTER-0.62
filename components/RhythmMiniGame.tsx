
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ICONS } from '../constants';
import { FillingType } from '../types';

interface RhythmMiniGameProps {
  onGameEnd: (bonus: number) => void;
}

const LANE_COUNT = 4;
const LANE_KEYS = ['d', 'f', 'j', 'k'];
const GAME_HEIGHT = 600;
const GAME_WIDTH = 400;
const HIT_LINE_Y = 520;
const NOTE_SIZE = 60;
const PERFECT_RANGE = 25;
const GOOD_RANGE = 55;
const INITIAL_LIVES = 10;
const BONUS_PER_SCORE = 1;
const NOTE_SPEED = 5;
const SPAWN_INTERVAL = 600;

type Note = {
  id: number;
  lane: number;
  y: number;
  type: FillingType;
  hit: boolean;
};

type Feedback = {
  id: number;
  text: string;
  color: string;
};

const INGREDIENTS = Object.values(FillingType);

const RhythmMiniGame: React.FC<RhythmMiniGameProps> = ({ onGameEnd }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'end'>('intro');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [activeLanes, setActiveLanes] = useState<boolean[]>(new Array(LANE_COUNT).fill(false));

  // FIX: Provided initial value undefined to satisfy strict TypeScript useRef argument requirement.
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastSpawnTimeRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const notesRef = useRef<Note[]>([]);
  notesRef.current = notes;

  const createFeedback = (text: string, color: string) => {
    const id = Date.now() + Math.random();
    setFeedbacks(prev => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, 800);
  };

  const handleHit = useCallback((lane: number) => {
    if (gameStateRef.current !== 'playing') return;

    setActiveLanes(prev => {
        const next = [...prev];
        next[lane] = true;
        setTimeout(() => setActiveLanes(prev => {
            const n = [...prev];
            n[lane] = false;
            return n;
        }), 100);
        return next;
    });

    const targetNote = notesRef.current.find(n => n.lane === lane && !n.hit && n.y > HIT_LINE_Y - 100 && n.y < HIT_LINE_Y + 100);

    if (targetNote) {
      const diff = Math.abs(targetNote.y - HIT_LINE_Y);
      let hitScore = 0;
      let hitType = '';
      let color = '';

      if (diff <= PERFECT_RANGE) {
        hitScore = 200;
        hitType = 'PERFECT!';
        color = 'text-yellow-400';
      } else if (diff <= GOOD_RANGE) {
        hitScore = 100;
        hitType = 'GOOD';
        color = 'text-green-400';
      }

      if (hitScore > 0) {
        setScore(s => s + hitScore + (combo * 10));
        setCombo(c => c + 1);
        setNotes(prev => prev.map(n => n.id === targetNote.id ? { ...n, hit: true } : n));
        createFeedback(hitType, color);
      }
    }
  }, [combo]);

  const runGameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== 'playing') return;

    // Spawn notes
    if (timestamp - lastSpawnTimeRef.current > SPAWN_INTERVAL) {
      lastSpawnTimeRef.current = timestamp;
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const type = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
      setNotes(prev => [...prev, { id: timestamp, lane, y: -NOTE_SIZE, type, hit: false }]);
    }

    // Move notes
    setNotes(prev => {
      let missed = 0;
      const updated = prev.map(n => ({ ...n, y: n.y + NOTE_SPEED }));
      const remaining = updated.filter(n => {
        if (!n.hit && n.y > HIT_LINE_Y + 50) {
          missed++;
          return false;
        }
        return n.y < GAME_HEIGHT + NOTE_SIZE;
      });

      if (missed > 0) {
        setCombo(0);
        setLives(l => {
            const next = l - missed;
            if (next <= 0) setGameState('end');
            return Math.max(0, next);
        });
        createFeedback('MISS', 'text-red-500');
      }
      return remaining;
    });

    gameLoopRef.current = requestAnimationFrame(runGameLoop);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const laneIndex = LANE_KEYS.indexOf(key);
      if (laneIndex !== -1) {
        handleHit(laneIndex);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleHit]);

  useEffect(() => {
    if (gameState === 'playing') {
      lastSpawnTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(runGameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, runGameLoop]);

  const bonus = score * BONUS_PER_SCORE;

  return (
    <div className="bg-slate-900 h-full w-full rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="w-full max-w-md flex justify-between items-center text-white mb-4 z-10">
        <div className="flex flex-col">
            <span className="text-sm opacity-70 uppercase tracking-widest">Score</span>
            <span className="text-3xl font-bold font-mono">{score.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-sm opacity-70 uppercase tracking-widest">Lives</span>
            <span className="text-3xl font-bold text-red-500">{'❤️'.repeat(Math.max(0, Math.ceil(lives / 2)))}</span>
        </div>
      </div>

      <div className="relative bg-slate-800 border-x-4 border-slate-700" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {/* Lanes Background */}
        <div className="absolute inset-0 flex">
          {[...Array(LANE_COUNT)].map((_, i) => (
            <div key={i} className={`flex-1 border-r border-slate-700 last:border-r-0 transition-colors duration-200 ${activeLanes[i] ? 'bg-slate-700/50' : ''}`} />
          ))}
        </div>

        {/* Hit Line */}
        <div className="absolute w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)]" style={{ top: HIT_LINE_Y }} />
        <div className="absolute w-full h-16 bg-gradient-to-b from-transparent to-cyan-500/10" style={{ top: HIT_LINE_Y - 30 }} />

        {/* Notes */}
        {notes.map(note => {
          if (note.hit) return null;
          const Icon = ICONS[note.type];
          return (
            <div
              key={note.id}
              className="absolute transition-opacity duration-100"
              style={{
                left: note.lane * (GAME_WIDTH / LANE_COUNT) + (GAME_WIDTH / LANE_COUNT / 2) - (NOTE_SIZE / 2),
                top: note.y,
                width: NOTE_SIZE,
                height: NOTE_SIZE
              }}
            >
              <Icon />
            </div>
          );
        })}

        {/* Feedbacks */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {feedbacks.map(f => (
                <div key={f.id} className={`absolute text-4xl font-black italic animate-tip-fly-up ${f.color}`} style={{ top: '40%' }}>
                    {f.text}
                </div>
            ))}
            {combo > 1 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-6xl font-black text-white/20">{combo}</span>
                    <span className="text-xl font-bold text-white/10 uppercase tracking-widest">Combo</span>
                </div>
            )}
        </div>

        {/* Touch Controls for Mobile */}
        <div className="absolute bottom-0 left-0 w-full h-32 flex">
             {[...Array(LANE_COUNT)].map((_, i) => (
                <button
                    key={i}
                    className="flex-1 active:bg-cyan-500/20 transition-colors border-t border-slate-700 font-black text-slate-500 text-2xl uppercase"
                    onMouseDown={() => handleHit(i)}
                    onTouchStart={(e) => { e.preventDefault(); handleHit(i); }}
                >
                    {LANE_KEYS[i]}
                </button>
             ))}
        </div>

        {/* Overlays */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-6 z-20 text-center">
            {gameState === 'intro' ? (
              <>
                <h3 className="text-4xl font-black mb-4 text-cyan-400 italic">붕어빵 리듬 파티</h3>
                <p className="mb-8 text-slate-300">내려오는 재료들이 하늘색 선에 닿을 때<br/>건반을 누르거나 터치하세요!<br/><br/><span className="bg-slate-700 px-3 py-1 rounded">D - F - J - K</span></p>
                <button
                  onClick={() => setGameState('playing')}
                  className="px-12 py-4 text-2xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all transform hover:scale-105"
                >
                  START GAME
                </button>
              </>
            ) : (
              <>
                <h3 className="text-5xl font-black mb-4 text-orange-500 italic">FINISH!</h3>
                <div className="bg-slate-700/50 p-6 rounded-xl mb-8 w-full max-w-xs">
                    <p className="text-slate-400 mb-1 uppercase tracking-widest text-sm">Final Score</p>
                    <p className="text-4xl font-bold text-white mb-4">{score.toLocaleString()}</p>
                    <p className="text-slate-400 mb-1 uppercase tracking-widest text-sm">Bonus Earned</p>
                    <p className="text-2xl font-bold text-green-400">₩{bonus.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => onGameEnd(bonus)}
                  className="px-10 py-4 text-xl font-bold bg-orange-500 hover:bg-orange-400 rounded-full transition-all transform hover:scale-105"
                >
                  RESULT PAGE
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RhythmMiniGame;
