
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mold, Customer, FillingType, ServingPlate, MoldState, CustomerOrder, Upgrades, UpgradeType, DailySpecial } from '../types';
import Header from './Header';
import BungeoppangGrill from './BungeoppangGrill';
import ControlPanel from './ControlPanel';
import CustomerQueue from './CustomerQueue';
import FillingSelectionModal from './FillingSelectionModal';
import { CUSTOMER_SPAWN_MIN_MS, CUSTOMER_SPAWN_MAX_MS, MAX_CUSTOMERS, ICONS, CUSTOMER_ICONS, BURN_TIME_MS, UPGRADE_CONFIG } from '../constants';
import GoldenBungeoppangMiniGame from './GoldenBungeoppangMiniGame';
import { soundManager } from '../utils/soundManager';

interface GameScreenProps {
    day: number;
    goal: number;
    initialTime: number;
    onDayEnd: (stats: { 
        revenue: number; 
        bunsSold: number;
        avgPatience: number;
        mostPopularFilling: FillingType | null;
        fillingsSold: Partial<Record<FillingType, number>>;
    }) => void;
    moldCount: number;
    cookTime: number;
    patienceTime: number;
    upgrades: Upgrades;
    pricePerBun: number;
    dailySpecial: DailySpecial | null;
}

type TipParticle = {
  id: number;
  amount: number;
  style: React.CSSProperties;
};

const GameScreen: React.FC<GameScreenProps> = ({ day, goal, initialTime, onDayEnd, moldCount, cookTime, patienceTime, upgrades, pricePerBun, dailySpecial }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [revenue, setRevenue] = useState(0);
    const revenueRef = useRef(revenue);
    revenueRef.current = revenue;

    const [molds, setMolds] = useState<Mold[]>(
        Array.from({ length: moldCount }, (_, i) => ({ id: i, state: MoldState.EMPTY, filling: null, progress: 0 }))
    );
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [servingPlate, setServingPlate] = useState<ServingPlate>({ 
        [FillingType.RED_BEAN]: 0, 
        [FillingType.CHOUX_CREAM]: 0,
        [FillingType.PIZZA]: 0,
        [FillingType.SWEET_POTATO]: 0,
        [FillingType.CHOCOLATE]: 0,
        [FillingType.STRAWBERRY]: 0,
        [FillingType.BLUEBERRY]: 0,
        [FillingType.HONEY]: 0,
    });
    const [tipParticles, setTipParticles] = useState<TipParticle[]>([]);
    const [fillingTarget, setFillingTarget] = useState<number | null>(null);
    const [isServing, setIsServing] = useState(false);
    const [isMiniGameActive, setIsMiniGameActive] = useState(false);
    
    const dayStatsRef = useRef({
        bunsSold: 0,
        servedCustomerCount: 0,
        totalPatienceRatioSum: 0,
        fillingsSold: {} as Partial<Record<FillingType, number>>,
    });

    // FIX: Provided initial value undefined to satisfy strict TypeScript useRef argument requirement.
    const gameLoopId = useRef<number | undefined>(undefined);
    const lastFrameTimeRef = useRef(0);
    const nextCustomerSpawnTimeRef = useRef(0);

    const startCooking = useCallback((id: number, filling: FillingType) => {
        setMolds(prevMolds => prevMolds.map(m =>
            m.id === id ? { ...m, state: MoldState.COOKING, filling, progress: cookTime } : m
        ));
    }, [cookTime]);

    const runGameLoop = useCallback((timestamp: number) => {
        if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
        const deltaTime = timestamp - lastFrameTimeRef.current;
        lastFrameTimeRef.current = timestamp;

        if (isMiniGameActive || fillingTarget !== null) {
            gameLoopId.current = requestAnimationFrame(runGameLoop);
            return;
        }

        if (deltaTime > 0 && deltaTime < 100) {
            setMolds(prev => prev.map(m => {
                if (m.state === MoldState.COOKING) {
                    const nextProgress = m.progress - deltaTime;
                    if (nextProgress <= 0) return { ...m, state: MoldState.READY, progress: BURN_TIME_MS };
                    return { ...m, progress: nextProgress };
                } else if (m.state === MoldState.READY) {
                    const nextProgress = m.progress - deltaTime;
                    if (nextProgress <= 0) return { ...m, state: MoldState.BURNT, progress: 0 };
                    return { ...m, progress: nextProgress };
                }
                return m;
            }));
            setCustomers(prev => prev.map(c => ({ ...c, patience: Math.max(0, c.patience - deltaTime) })));
        }
        
        if (timestamp >= nextCustomerSpawnTimeRef.current) {
            nextCustomerSpawnTimeRef.current = timestamp + Math.random() * (CUSTOMER_SPAWN_MAX_MS - CUSTOMER_SPAWN_MIN_MS) + CUSTOMER_SPAWN_MIN_MS;
            
            setCustomers(prevCustomers => {
                if (prevCustomers.length >= MAX_CUSTOMERS) return prevCustomers;
                const fillings = Object.values(FillingType);
                const order: CustomerOrder = {};
                const totalItems = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < totalItems; i++) {
                    const randomFilling = fillings[Math.floor(Math.random() * fillings.length)];
                    order[randomFilling] = (order[randomFilling] || 0) + 1;
                }
                const randomIcon = CUSTOMER_ICONS[Math.floor(Math.random() * CUSTOMER_ICONS.length)];
                return [...prevCustomers, { id: Date.now(), order, patience: patienceTime, maxPatience: patienceTime, icon: randomIcon }];
            });
        }

        gameLoopId.current = requestAnimationFrame(runGameLoop);
    }, [isMiniGameActive, fillingTarget, patienceTime]);

    useEffect(() => {
        gameLoopId.current = requestAnimationFrame(runGameLoop);
        return () => { if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current); };
    }, [runGameLoop]);

    useEffect(() => {
        if (isMiniGameActive) return;
        const timer = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    const stats = dayStatsRef.current;
                    onDayEnd({
                        revenue: revenueRef.current,
                        bunsSold: stats.bunsSold,
                        avgPatience: Math.round(stats.servedCustomerCount > 0 ? (stats.totalPatienceRatioSum / stats.servedCustomerCount) * 100 : 0),
                        mostPopularFilling: (Object.entries(stats.fillingsSold) as [FillingType, number][]).reduce((a, b) => (a[1] || 0) > (b[1] || 0) ? a : b, [null, 0] as any)[0],
                        fillingsSold: stats.fillingsSold
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => window.clearInterval(timer);
    }, [isMiniGameActive, onDayEnd]);

    useEffect(() => {
        if (isServing || timeLeft <= 0 || isMiniGameActive) return;

        const customerToServe = customers.find(customer => {
            if (customer.patience <= 0) return false;
            return Object.entries(customer.order).every(([filling, required]) => 
                servingPlate[filling as FillingType] >= (required || 0)
            );
        });

        if (customerToServe) {
            setIsServing(true);
            const servingLevel = upgrades[UpgradeType.FASTER_SERVING];
            const servingTime = UPGRADE_CONFIG[UpgradeType.FASTER_SERVING].levels[servingLevel].value;
            
            setTimeout(() => {
                setCustomers(prev => {
                    const c = prev.find(p => p.id === customerToServe.id);
                    if (!c) { setIsServing(false); return prev; }

                    let totalItemsCount = 0;
                    Object.values(c.order).forEach(q => { if(typeof q === 'number') totalItemsCount += q; });

                    dayStatsRef.current.bunsSold += totalItemsCount;
                    dayStatsRef.current.servedCustomerCount += 1;
                    dayStatsRef.current.totalPatienceRatioSum += c.patience / c.maxPatience;
                    Object.entries(c.order).forEach(([f, q]) => {
                        const quantity = q as number;
                        if (quantity) {
                          const filling = f as FillingType;
                          dayStatsRef.current.fillingsSold[filling] = (dayStatsRef.current.fillingsSold[filling] || 0) + quantity;
                        }
                    });

                    const earningsValue = totalItemsCount * pricePerBun;
                    const patienceRatio = c.patience / c.maxPatience;
                    const tipAmount = patienceRatio > 0.8 ? Math.floor(earningsValue * 0.2) : (patienceRatio > 0.5 ? Math.floor(earningsValue * 0.1) : 0);
                    
                    if (tipAmount > 0) {
                        const tid = Date.now() + Math.random();
                        setTipParticles(t => [...t, { id: tid, amount: tipAmount, style: { top: '40%', left: '20%' } }]);
                        setTimeout(() => setTipParticles(t => t.filter(p => p.id !== tid)), 1400);
                    }
                    
                    soundManager.playCoin();
                    setRevenue(r => r + earningsValue + tipAmount);
                    setServingPlate(p => {
                        const next = { ...p };
                        Object.entries(c.order).forEach(([f, q]) => { if (typeof q === 'number') next[f as FillingType] -= q; });
                        return next;
                    });

                    setIsServing(false);
                    return prev.filter(p => p.id !== customerToServe.id);
                });
            }, servingTime);
        }
    }, [servingPlate, customers, pricePerBun, upgrades, isServing, timeLeft, isMiniGameActive]);

    const handleFillingSelection = (filling: FillingType) => {
        soundManager.playClick();
        if (fillingTarget === null) return;
        startCooking(fillingTarget, filling);
        setFillingTarget(null);
    };

    return (
        <div className="flex flex-col h-full bg-amber-50 rounded-lg p-2 sm:p-4 gap-2 sm:gap-4 relative overflow-hidden">
            <Header day={day} timeLeft={timeLeft} revenue={revenue} goal={goal} dailySpecial={dailySpecial} />
            <div className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
                <div className="w-full lg:w-1/4 h-48 lg:h-full flex-shrink-0">
                    <CustomerQueue customers={customers} upgrades={upgrades}/>
                </div>
                <div className="w-full lg:w-3/4 flex-grow flex flex-col gap-4 relative">
                    <BungeoppangGrill 
                        molds={molds} 
                        setMolds={setMolds} 
                        addTimeout={() => {}} 
                        setServingPlate={setServingPlate} 
                        setFillingTarget={setFillingTarget}
                        cookTime={cookTime}
                        upgrades={upgrades}
                        fillingTarget={fillingTarget}
                    />
                    <ControlPanel 
                        servingPlate={servingPlate} 
                        upgrades={upgrades} 
                        onCleanAllMolds={() => {
                            soundManager.playClick();
                            setMolds(prev => prev.map(m => ({ ...m, state: MoldState.EMPTY, filling: null, progress: 0 })));
                        }}
                    />
                </div>
            </div>
            
            <FillingSelectionModal 
                isOpen={fillingTarget !== null}
                onSelect={handleFillingSelection}
                onClose={() => setFillingTarget(null)}
            />
            
            {isMiniGameActive && (
                <GoldenBungeoppangMiniGame 
                    challengerIcon="👑"
                    onComplete={(success) => {
                        if (success) {
                            soundManager.playUpgrade();
                            setRevenue(r => r + 5000);
                        } else {
                            soundManager.playBurnt();
                        }
                        setIsMiniGameActive(false);
                    }}
                />
            )}
            
            <div className="absolute inset-0 pointer-events-none z-50">
                {tipParticles.map(p => (
                    <div key={p.id} className="tip-particle" style={p.style}>
                        💰 +₩{p.amount.toLocaleString()}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameScreen;
