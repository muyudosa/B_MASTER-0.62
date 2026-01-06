
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ICONS } from '../constants';

// --- Component Props ---
interface PacManMiniGameProps {
  onGameEnd: (bonus: number) => void;
}

// --- Game Constants & Types ---
const TILE_SIZE_DEFAULT = 24;
const INITIAL_LIVES = 3;
const BONUS_PER_PELLET = 10;
const BONUS_PER_GHOST = 200;
const FRIGHTENED_DURATION = 7000;
const GHOST_NAMES = ['Blinky', 'Pinky', 'Inky', 'Clyde'];
const GAME_TICK_MS = 150;

// 고립된 구역이 없는 새로운 미로 레이아웃 (W:벽, .:점, o:파워점, P:플레이어, G:유령)
const mazeLayout = [
    "WWWWWWWWWWWWWWWWWWWWW",
    "W.o.......W.......o.W",
    "W.WWW.WWW.W.WWW.WWW.W",
    "W...................W",
    "W.WWW.W.WWWWW.W.WWW.W",
    "W.....W...W...W.....W",
    "WWWWW.WWW.W.WWW.WWWWW",
    "W.........G.........W",
    "WWWWW.WWW.W.WWW.WWWWW",
    "W.....W...W...W.....W",
    "W.WWW.W.WWWWW.W.WWW.W",
    "W...................W",
    "W.WWW.WWW.W.WWW.WWW.W",
    "W.o.......P.......o.W",
    "WWWWWWWWWWWWWWWWWWWWW",
];

const MAZE_WIDTH = mazeLayout[0].length;
const MAZE_HEIGHT = mazeLayout.length;

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'STOP';
export type Position = { x: number; y: number };
export type GhostState = 'CHASE' | 'SCATTER' | 'FRIGHTENED';
export type Ghost = {
  id: number;
  name: string;
  pos: Position;
  dir: Direction;
  state: GhostState;
  colorFilter: string;
};

const isWall = (x: number, y: number, layout: string[]): boolean => {
  if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return true;
  return layout[y][x] === 'W';
};

const PacManMiniGame: React.FC<PacManMiniGameProps> = ({ onGameEnd }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'end'>('intro');
  const [pellets, setPellets] = useState<boolean[][]>([]);
  const [totalPellets, setTotalPellets] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 10, y: 13 });
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [tileSize, setTileSize] = useState(TILE_SIZE_DEFAULT);
  
  const playerDir = useRef<Direction>('STOP');
  const playerNextDir = useRef<Direction>('STOP');
  const frightenedTimer = useRef<number>(0);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastUpdateTime = useRef<number>(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = gameContainerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const tileW = width / MAZE_WIDTH;
        const tileH = height / MAZE_HEIGHT;
        setTileSize(Math.min(tileW, tileH));
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const initGame = useCallback(() => {
    let pelletCount = 0;
    const newPellets: boolean[][] = Array(MAZE_HEIGHT).fill(null).map(() => Array(MAZE_WIDTH).fill(false));
    let initialPlayerPos: Position = { x: 10, y: 13 };
    const initialGhosts: Ghost[] = [];
    let ghostIndex = 0;
    
    mazeLayout.forEach((row, y) => {
      row.split('').forEach((char, x) => {
        if (char === 'P') initialPlayerPos = { x, y };
        if (char === '.' || char === 'o') {
          newPellets[y][x] = true;
          pelletCount++;
        }
        if (char === 'G') {
            const ghostColors = ['hue-rotate(0deg)', 'hue-rotate(270deg)', 'hue-rotate(180deg)', 'hue-rotate(45deg)'];
            initialGhosts.push({
                id: ghostIndex,
                name: GHOST_NAMES[ghostIndex % GHOST_NAMES.length],
                pos: { x, y },
                dir: 'UP',
                state: 'CHASE',
                colorFilter: ghostColors[ghostIndex % ghostColors.length]
            });
            ghostIndex++;
        }
      });
    });

    setPlayerPos(initialPlayerPos);
    setGhosts(initialGhosts);
    setPellets(newPellets);
    setTotalPellets(pelletCount);
    setScore(0);
    setLives(INITIAL_LIVES);
    playerDir.current = 'STOP';
    playerNextDir.current = 'STOP';
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== 'playing') return;

    const delta = timestamp - lastUpdateTime.current;
    if (delta < GAME_TICK_MS) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
    }
    lastUpdateTime.current = timestamp;

    const { x, y } = playerPos;
    let nextPlayerPos = { ...playerPos };
    
    if (playerNextDir.current !== 'STOP') {
        if (playerNextDir.current === 'UP' && !isWall(x, y-1, mazeLayout)) playerDir.current = playerNextDir.current;
        if (playerNextDir.current === 'DOWN' && !isWall(x, y+1, mazeLayout)) playerDir.current = playerNextDir.current;
        if (playerNextDir.current === 'LEFT' && !isWall(x-1, y, mazeLayout)) playerDir.current = playerNextDir.current;
        if (playerNextDir.current === 'RIGHT' && !isWall(x+1, y, mazeLayout)) playerDir.current = playerNextDir.current;
    }

    if (playerDir.current === 'UP') nextPlayerPos.y -= 1;
    if (playerDir.current === 'DOWN') nextPlayerPos.y += 1;
    if (playerDir.current === 'LEFT') nextPlayerPos.x -= 1;
    if (playerDir.current === 'RIGHT') nextPlayerPos.x += 1;
    
    if (isWall(nextPlayerPos.x, nextPlayerPos.y, mazeLayout)) {
        playerDir.current = 'STOP';
        nextPlayerPos = playerPos;
    }
    
    const pX = Math.round(nextPlayerPos.x);
    const pY = Math.round(nextPlayerPos.y);
    if (pellets[pY] && pellets[pY][pX]) {
        setPellets(prev => {
            const newPellets = prev.map(r => [...r]);
            newPellets[pY][pX] = false;
            return newPellets;
        });
        setScore(s => s + BONUS_PER_PELLET);
        setTotalPellets(c => c - 1);
        if (mazeLayout[pY][pX] === 'o') {
            frightenedTimer.current = FRIGHTENED_DURATION;
        }
    }
    
    if (frightenedTimer.current > 0) {
        frightenedTimer.current -= GAME_TICK_MS;
    }
    
    let playerWasHit = false;
    const newGhosts: Ghost[] = ghosts.map(ghost => {
        const isFrightened = frightenedTimer.current > 0;
        const ghostState: GhostState = isFrightened ? 'FRIGHTENED' : 'CHASE';
        const newGhost: Ghost = { ...ghost, pos: { ...ghost.pos }, state: ghostState };
        
        const choices: Direction[] = [];
        if (!isWall(newGhost.pos.x, newGhost.pos.y-1, mazeLayout)) choices.push('UP');
        if (!isWall(newGhost.pos.x, newGhost.pos.y+1, mazeLayout)) choices.push('DOWN');
        if (!isWall(newGhost.pos.x-1, newGhost.pos.y, mazeLayout)) choices.push('LEFT');
        if (!isWall(newGhost.pos.x+1, newGhost.pos.y, mazeLayout)) choices.push('RIGHT');
        
        const oppositeDir: Record<Direction, Direction> = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT', 'STOP': 'STOP' };
        let availableChoices = choices.filter(c => c !== oppositeDir[newGhost.dir]);
        if (availableChoices.length === 0) availableChoices = choices;
        newGhost.dir = availableChoices[Math.floor(Math.random() * availableChoices.length)];

        if (newGhost.dir === 'UP') newGhost.pos.y -= 1;
        if (newGhost.dir === 'DOWN') newGhost.pos.y += 1;
        if (newGhost.dir === 'LEFT') newGhost.pos.x -= 1;
        if (newGhost.dir === 'RIGHT') newGhost.pos.x += 1;

        if (newGhost.pos.x === pX && newGhost.pos.y === pY) {
            if (newGhost.state === 'FRIGHTENED') {
                setScore(s => s + BONUS_PER_GHOST);
                newGhost.pos = {x: 10, y: 7};
            } else {
                playerWasHit = true;
            }
        }
        return newGhost;
    });

    if (playerWasHit) {
        setLives(l => l - 1);
        nextPlayerPos = {x: 10, y: 13};
        playerDir.current = 'STOP';
        playerNextDir.current = 'STOP';
    }

    setPlayerPos(nextPlayerPos);
    setGhosts(newGhosts);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, playerPos, pellets, ghosts]);

  useEffect(() => {
    if ((totalPellets <= 0 && gameState === 'playing') || (lives <= 0 && gameState === 'playing')) {
      setGameState('end');
    }
  }, [totalPellets, lives, gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (e.key === 'ArrowUp') playerNextDir.current = 'UP';
        if (e.key === 'ArrowDown') playerNextDir.current = 'DOWN';
        if (e.key === 'ArrowLeft') playerNextDir.current = 'LEFT';
        if (e.key === 'ArrowRight') playerNextDir.current = 'RIGHT';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      lastUpdateTime.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
  }, [gameState, gameLoop]);
  
  const bonus = score;
  
  if (gameState === 'intro') {
    return (
      <div className="bg-amber-200/80 p-6 rounded-xl shadow-inner border-2 border-amber-300 w-full max-w-lg text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold text-amber-800 mb-4">붕어빵 팩맨</h2>
        <p className="text-stone-700 text-lg mb-6">미로를 탐험하며 모든 팥을 먹으세요!<br/>탄 붕어빵 유령들을 조심하세요.</p>
        <button
          onClick={() => setGameState('playing')}
          className="px-8 py-3 text-xl font-bold text-white bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-all"
        >
          게임 시작!
        </button>
      </div>
    );
  }

  if (gameState === 'end') {
    return (
       <div className="bg-amber-200/80 p-6 rounded-xl shadow-inner border-2 border-amber-300 w-full max-w-lg text-center flex flex-col items-center">
         <h2 className="text-4xl font-bold text-amber-800 mb-4">{totalPellets <= 0 ? '성공!' : '게임 오버!'}</h2>
         <p className="text-2xl text-stone-700 mb-2">최종 점수: {score}</p>
         <p className="text-xl text-green-600 font-bold mb-6">획득 보너스: ₩{bonus.toLocaleString()}</p>
         <button
           onClick={() => onGameEnd(bonus)}
           className="px-8 py-3 text-xl font-bold text-white bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-all"
         >
           가게로 돌아가기
         </button>
       </div>
    );
  }

  return (
    <div className="bg-slate-900 p-2 rounded-xl shadow-inner border-2 border-slate-700 w-full max-w-2xl flex-grow flex flex-col items-center overflow-hidden">
      <div className="w-full flex justify-between items-center mb-2 text-white font-bold text-sm sm:text-lg px-2">
        <div>점수: {score}</div>
        <div>목숨: {'❤️'.repeat(lives)}</div>
      </div>
      <div ref={gameContainerRef} className="relative w-full flex-grow flex items-center justify-center overflow-hidden">
        <div className="relative bg-black" style={{ width: MAZE_WIDTH * tileSize, height: MAZE_HEIGHT * tileSize }}>
            {mazeLayout.map((row, y) => row.split('').map((char, x) => {
                if (char !== 'W') return null;
                return <div key={`${x}-${y}`} className="absolute bg-blue-900/50 border border-blue-700/30" style={{left: x*tileSize, top: y*tileSize, width: tileSize, height: tileSize}}/>
            }))}
            {pellets.map((row, y) => row.map((hasPellet, x) => {
                if (!hasPellet) return null;
                const isPowerPellet = mazeLayout[y][x] === 'o';
                return <div key={`p-${x}-${y}`} className="absolute flex items-center justify-center" style={{left: x*tileSize, top: y*tileSize, width: tileSize, height: tileSize}}>
                    <div className={`${isPowerPellet ? 'w-2/3 h-2/3 animate-pulse' : 'w-1/4 h-1/4 bg-yellow-400 rounded-full'}`}>
                        {isPowerPellet ? <ICONS.CHOUX_CREAM /> : null}
                    </div>
                </div>
            }))}
            <div className="absolute z-10" style={{ transition: `all ${GAME_TICK_MS}ms linear`, left: playerPos.x * tileSize, top: playerPos.y * tileSize, width: tileSize, height: tileSize }}>
                <ICONS.BUNGEOPPANG crustLevel={1} />
            </div>
            {ghosts.map(g => (
                <div key={g.id} className="absolute z-10" style={{ 
                    transition: `all ${GAME_TICK_MS}ms linear`,
                    left: g.pos.x * tileSize, 
                    top: g.pos.y * tileSize, 
                    width: tileSize, 
                    height: tileSize,
                    filter: g.state === 'FRIGHTENED' ? 'grayscale(1) brightness(2)' : g.colorFilter,
                    opacity: g.state === 'FRIGHTENED' && (frightenedTimer.current < 2000 && Math.floor(frightenedTimer.current / 200) % 2 === 0) ? 0.4 : 1,
                    }}>
                    <ICONS.BUNGEOPPANG crustLevel={3} />
                </div>
            ))}
        </div>
      </div>
       <div className="mt-2 grid grid-cols-3 gap-2 w-40 sm:w-48 select-none">
        <div />
        <button onTouchStart={() => playerNextDir.current = 'UP'} className="h-10 sm:h-14 bg-slate-700 text-white font-bold text-xl rounded-full shadow-md active:bg-slate-600">▲</button>
        <div />
        <button onTouchStart={() => playerNextDir.current = 'LEFT'} className="h-10 sm:h-14 bg-slate-700 text-white font-bold text-xl rounded-full shadow-md active:bg-slate-600">◀</button>
        <div />
        <button onTouchStart={() => playerNextDir.current = 'RIGHT'} className="h-10 sm:h-14 bg-slate-700 text-white font-bold text-xl rounded-full shadow-md active:bg-slate-600">▶</button>
        <div />
        <button onTouchStart={() => playerNextDir.current = 'DOWN'} className="h-10 sm:h-14 bg-slate-700 text-white font-bold text-xl rounded-full shadow-md active:bg-slate-600">▼</button>
        <div />
      </div>
    </div>
  );
};

export default PacManMiniGame;
