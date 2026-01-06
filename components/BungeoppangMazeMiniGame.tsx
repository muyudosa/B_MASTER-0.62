
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ICONS } from '../constants';
import { FillingType } from '../types';

interface BungeoppangMazeMiniGameProps {
  onGameEnd: (bonus: number) => void;
}

const MAZE_WIDTH = 13; // 가로 크기를 살짝 줄여 모바일 대응
const MAZE_HEIGHT = 9;
const GAME_TIME = 60;
const BONUS_PER_SECOND = 100;
const MAX_BONUS = 5000;
const MOVE_COOLDOWN = 120;

type Cell = {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
};

type Position = { x: number; y: number };

const generateMaze = (width: number, height: number): Cell[][] => {
  const maze: Cell[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      walls: { top: true, right: true, bottom: true, left: true },
      visited: false,
    }))
  );

  const stack: Position[] = [];
  const startPos = { x: 0, y: 0 };
  maze[startPos.y][startPos.x].visited = true;
  stack.push(startPos);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = [];

    // 이웃 셀 체크 (수정된 좌표 로직)
    if (current.y > 0 && !maze[current.y - 1][current.x].visited) neighbors.push({ x: current.x, y: current.y - 1, dir: 'top' });
    if (current.x < width - 1 && !maze[current.y][current.x + 1].visited) neighbors.push({ x: current.x + 1, y: current.y, dir: 'right' });
    if (current.y < height - 1 && !maze[current.y + 1][current.x].visited) neighbors.push({ x: current.x, y: current.y + 1, dir: 'bottom' });
    if (current.x > 0 && !maze[current.y][current.x - 1].visited) neighbors.push({ x: current.x - 1, y: current.y, dir: 'left' });

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      if (next.dir === 'top') {
        maze[current.y][current.x].walls.top = false;
        maze[next.y][next.x].walls.bottom = false;
      } else if (next.dir === 'right') {
        maze[current.y][current.x].walls.right = false;
        maze[next.y][next.x].walls.left = false;
      } else if (next.dir === 'bottom') {
        maze[current.y][current.x].walls.bottom = false;
        maze[next.y][next.x].walls.top = false;
      } else if (next.dir === 'left') {
        maze[current.y][current.x].walls.left = false;
        maze[next.y][next.x].walls.right = false;
      }
      
      maze[next.y][next.x].visited = true;
      stack.push({ x: next.x, y: next.y });
    } else {
      stack.pop();
    }
  }
  return maze;
};

const BungeoppangMazeMiniGame: React.FC<BungeoppangMazeMiniGameProps> = ({ onGameEnd }) => {
  const [maze, setMaze] = useState<Cell[][] | null>(null);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [goalPos] = useState<Position>({ x: MAZE_WIDTH - 1, y: MAZE_HEIGHT - 1 });
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'end'>('intro');
  const [bonus, setBonus] = useState(0);

  const keysPressedRef = useRef<Record<string, boolean>>({});
  const lastMoveTimeRef = useRef<number>(0);
  const gameLoopRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMaze(generateMaze(MAZE_WIDTH, MAZE_HEIGHT));
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft <= 0 && gameState === 'playing') {
        setBonus(0);
        setGameState('end');
    }
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
        setBonus(Math.min(MAX_BONUS, timeLeft * BONUS_PER_SECOND));
        setGameState('end');
    }
  }, [playerPos, goalPos, gameState, timeLeft]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysPressedRef.current[e.key] = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || !maze) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (timestamp - lastMoveTimeRef.current > MOVE_COOLDOWN) {
        let dx = 0;
        let dy = 0;

        if (keysPressedRef.current['ArrowUp']) dy = -1;
        else if (keysPressedRef.current['ArrowDown']) dy = 1;
        else if (keysPressedRef.current['ArrowLeft']) dx = -1;
        else if (keysPressedRef.current['ArrowRight']) dx = 1;

        if (dx !== 0 || dy !== 0) {
          setPlayerPos(currentPos => {
            const { x, y } = currentPos;
            const cell = maze[y][x];

            let canMove = false;
            if (dx === 1 && !cell.walls.right) canMove = true;
            if (dx === -1 && !cell.walls.left) canMove = true;
            if (dy === 1 && !cell.walls.bottom) canMove = true;
            if (dy === -1 && !cell.walls.top) canMove = true;

            if (canMove) {
              lastMoveTimeRef.current = timestamp;
              return { x: x + dx, y: y + dy };
            }
            return currentPos;
          });
        }
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, maze]);

  const renderMaze = () => {
    if (!maze) return <div className="w-full h-full bg-slate-700 animate-pulse" />;
    const cellWidth = 100 / MAZE_WIDTH;
    const cellHeight = 100 / MAZE_HEIGHT;
    const GoalIcon = ICONS[FillingType.RED_BEAN];

    return (
      <div className="relative w-full h-full bg-white p-1 rounded-lg">
        {maze.flat().map(cell => (
          <div
            key={`${cell.x}-${cell.y}`}
            className="absolute bg-amber-50"
            style={{
              left: `${cell.x * cellWidth}%`,
              top: `${cell.y * cellHeight}%`,
              width: `${cellWidth}%`,
              height: `${cellHeight}%`,
              borderTop: cell.walls.top ? '2px solid #92400e' : 'none',
              borderRight: cell.walls.right ? '2px solid #92400e' : 'none',
              borderBottom: cell.walls.bottom ? '2px solid #92400e' : 'none',
              borderLeft: cell.walls.left ? '2px solid #92400e' : 'none',
              boxSizing: 'border-box',
            }}
          />
        ))}
        <div className="absolute transition-all duration-100 ease-linear z-10" style={{ left: `${playerPos.x * cellWidth}%`, top: `${playerPos.y * cellHeight}%`, width: `${cellWidth}%`, height: `${cellHeight}%` }}>
            <ICONS.BUNGEOPPANG crustLevel={1} />
        </div>
        <div className="absolute opacity-80" style={{ left: `${goalPos.x * cellWidth}%`, top: `${goalPos.y * cellHeight}%`, width: `${cellWidth}%`, height: `${cellHeight}%` }}>
            <GoalIcon />
        </div>
      </div>
    );
  };

  const ControlButton: React.FC<{ children: React.ReactNode; directionKey: string }> = ({ children, directionKey }) => {
    const handlePress = () => { if (gameState === 'playing') keysPressedRef.current[directionKey] = true; };
    const handleRelease = () => { keysPressedRef.current[directionKey] = false; };
    return (
      <button onMouseDown={handlePress} onMouseUp={handleRelease} onMouseLeave={handleRelease} onTouchStart={handlePress} onTouchEnd={handleRelease}
        className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-600 text-white font-bold text-2xl rounded-full shadow-lg active:bg-slate-700 active:scale-90 transition-all"
      >{children}</button>
    );
  };

  if (gameState === 'intro') {
    return (
      <div className="bg-amber-100 p-6 rounded-3xl border-4 border-amber-300 w-full max-w-lg text-center flex flex-col items-center">
        <h2 className="text-2xl font-black text-amber-900 mb-2">미로 탈출</h2>
        <p className="text-stone-600 mb-6 text-sm sm:text-base">팥을 찾아 미로를 빠져나가세요!<br/>빠를수록 더 많은 보너스!</p>
        <button onClick={() => setGameState('playing')} className="px-10 py-3 text-lg font-black text-white bg-orange-500 rounded-full shadow-lg hover:brightness-110 active:scale-95 transition-all">시작</button>
      </div>
    );
  }

  if (gameState === 'end') {
    return (
      <div className="bg-amber-100 p-6 rounded-3xl border-4 border-amber-300 w-full max-w-lg text-center flex flex-col items-center">
        <h2 className="text-3xl font-black text-amber-900 mb-4">{bonus > 0 ? '성공!' : '실패!'}</h2>
        <p className="text-xl text-green-600 font-bold mb-6">보너스: ₩{bonus.toLocaleString()}</p>
        <button onClick={() => onGameEnd(bonus)} className="px-10 py-3 text-lg font-black text-white bg-orange-500 rounded-full shadow-lg active:scale-95 transition-all">돌아가기</button>
      </div>
    );
  }

  return (
    <div className="bg-amber-200/90 p-3 rounded-3xl border-4 border-amber-400 w-full max-w-lg flex flex-col items-center gap-3">
      <div className="w-full flex justify-between items-center px-2">
        <span className="text-xl font-black text-amber-900">남은 시간: {timeLeft}s</span>
      </div>
      <div className="w-full shadow-inner border-4 border-amber-800 rounded-xl overflow-hidden" style={{ aspectRatio: `${MAZE_WIDTH} / ${MAZE_HEIGHT}` }}>
        {renderMaze()}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div /> <ControlButton directionKey="ArrowUp">▲</ControlButton> <div />
        <ControlButton directionKey="ArrowLeft">◀</ControlButton> <div /> <ControlButton directionKey="ArrowRight">▶</ControlButton>
        <div /> <ControlButton directionKey="ArrowDown">▼</ControlButton> <div />
      </div>
    </div>
  );
};

export default BungeoppangMazeMiniGame;
