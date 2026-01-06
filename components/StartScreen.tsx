
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UpgradeType, Upgrades, DailySpecial } from '../types';
import { LEVEL_CONFIG, BASE_PRICE_PER_BUN } from '../constants';
import TutorialModal from './TutorialModal';
import RecipeBookModal from './RecipeBookModal';
import UpgradeModal from './UpgradeModal';
import StartScreenAnimation from './StartScreenAnimation';
import DailySpecialModal from './DailySpecialModal';

interface StartScreenProps {
    onStart: (config: { time: number; goal: number; pricePerBun: number }) => void;
    day: number;
    totalRevenue: number;
    upgrades: Upgrades;
    onPurchaseUpgrade: (upgradeType: UpgradeType) => void;
    onReset: () => void;
    lastConfig: { time: number; goal: number } | null;
    dailySpecial: DailySpecial | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, day, totalRevenue, upgrades, onPurchaseUpgrade, onReset, dailySpecial }) => {
    const [dayDuration, setDayDuration] = useState(90);
    const [priceModifier, setPriceModifier] = useState(1.0);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showRecipeBook, setShowRecipeBook] = useState(false);
    const [showUpgrades, setShowUpgrades] = useState(false);
    const [showSpecialModal, setShowSpecialModal] = useState(false);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('bungeoppangJangsaTutorialSeen');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
            localStorage.setItem('bungeoppangJangsaTutorialSeen', 'true');
        }
    }, []);
    
    useEffect(() => {
        if (dailySpecial) {
             const hasSeenKey = `dailySpecialSeen_day${day}`;
             if (!sessionStorage.getItem(hasSeenKey)) {
                const timer = window.setTimeout(() => {
                    setShowSpecialModal(true);
                    sessionStorage.setItem(hasSeenKey, 'true');
                }, 500);
                return () => window.clearTimeout(timer);
             }
        }
    }, [dailySpecial, day]);

    const levelConfig = useMemo(() => {
        if (day > LEVEL_CONFIG.length) {
            const lastLevel = LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
            return {
                day: day,
                goal: Math.floor(lastLevel.goal * Math.pow(1.2, day - LEVEL_CONFIG.length)),
            };
        }
        return LEVEL_CONFIG[day - 1];
    }, [day]);

    const handleStart = useCallback(() => {
        onStart({ time: dayDuration, goal: levelConfig.goal, pricePerBun: BASE_PRICE_PER_BUN * priceModifier });
    }, [onStart, dayDuration, levelConfig, priceModifier]);
    
    const priceModifierPercent = useMemo(() => Math.round((priceModifier - 1) * 100), [priceModifier]);

    return (
        <div className="flex flex-col h-full bg-amber-50 rounded-lg p-3 sm:p-4 overflow-hidden relative font-['Noto_Sans_KR']">
            {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
            {showRecipeBook && <RecipeBookModal onClose={() => setShowRecipeBook(false)} />}
            {showSpecialModal && dailySpecial && <DailySpecialModal special={dailySpecial} onClose={() => setShowSpecialModal(false)} />}
            {showUpgrades && (
                <UpgradeModal
                    totalRevenue={totalRevenue}
                    upgrades={upgrades}
                    onPurchaseUpgrade={onPurchaseUpgrade}
                    onClose={() => setShowUpgrades(false)}
                    dailySpecial={dailySpecial}
                />
            )}
            
            {/* 상단 공간 확보를 위해 애니메이션 높이 축소 */}
            <div className="w-full h-16 sm:h-24 mb-1 relative flex items-center justify-center flex-shrink-0">
                <div className="scale-75 sm:scale-100">
                    <StartScreenAnimation upgrades={upgrades} />
                </div>
            </div>
            
            <header className="text-center z-10 relative mb-2 flex-shrink-0">
                <h1 className="text-3xl sm:text-6xl font-black text-amber-900 tracking-tighter leading-none" style={{ textShadow: '2px 2px 0px rgba(245, 158, 11, 0.3)' }}>
                    붕어빵 장사
                </h1>
                <p className="text-sm sm:text-xl text-amber-700/80 font-black italic tracking-tight">달콤 바삭한 이야기</p>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center z-10 relative overflow-y-auto px-1 py-1">
                <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-[28px] shadow-xl border-2 border-amber-100 w-full max-w-sm text-center flex flex-col transform transition-all">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <span className="bg-amber-100 text-amber-950 px-3 py-0.5 rounded-full font-black text-sm sm:text-lg tracking-widest shadow-sm">{day}일차</span>
                        <div className="text-right">
                            <p className="text-[10px] text-stone-500 font-black uppercase tracking-tighter">목표</p>
                            <p className="text-lg sm:text-2xl font-black text-emerald-600 tracking-tighter leading-none">₩{levelConfig.goal.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-4 mb-4 px-1">
                        <div className="text-left">
                            <div className="flex justify-between items-center mb-0.5">
                                <p className="font-black text-stone-700 text-base sm:text-lg">장사 시간</p>
                                <p className="text-amber-700 font-black text-lg sm:text-xl">{dayDuration}초</p>
                            </div>
                            <input
                                type="range"
                                min="30"
                                max="180"
                                step="15"
                                value={dayDuration}
                                onChange={(e) => setDayDuration(Number(e.target.value))}
                                className="w-full h-2 bg-amber-100 rounded-full appearance-none cursor-pointer accent-amber-600 border border-amber-200"
                            />
                        </div>
                         <div className="text-left">
                            <div className="flex justify-between items-center mb-0.5">
                                <p className="font-black text-stone-700 text-base sm:text-lg">판매 가격</p>
                                <p className={`font-black text-lg sm:text-xl ${
                                    priceModifier > 1.0 ? 'text-emerald-600' : 
                                    priceModifier < 1.0 ? 'text-red-600' : 'text-stone-700'
                                }`}>
                                    {priceModifier === 1.0 ? '기본' : `${priceModifierPercent > 0 ? '+' : ''}${priceModifierPercent}%`}
                                </p>
                            </div>
                             <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.1"
                                value={priceModifier}
                                onChange={(e) => setPriceModifier(Number(e.target.value))}
                                className="w-full h-2 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-700 border border-stone-300"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleStart}
                        className="w-full py-3 sm:py-4 text-2xl sm:text-4xl font-black text-white bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-[20px] shadow-lg active:scale-95 transition-all tracking-tighter border-b-[6px] border-orange-800 hover:brightness-105"
                    >
                        장사 시작!
                    </button>
                </div>
            </main>

            <footer className="mt-1 flex flex-col justify-center items-center gap-1 z-10 relative flex-shrink-0 mb-1">
                <div className="grid grid-cols-2 gap-1.5 w-full max-w-sm px-1">
                    <button onClick={() => setShowUpgrades(true)} className="px-2 py-2 text-xs sm:text-base font-black text-amber-900 bg-white/70 rounded-xl hover:bg-white transition-all border-2 border-white/50 shadow-sm">
                        상점
                    </button>
                    <button onClick={() => setShowRecipeBook(true)} className="px-2 py-2 text-xs sm:text-base font-black text-amber-900 bg-white/70 rounded-xl hover:bg-white transition-all border-2 border-white/50 shadow-sm">
                        도감
                    </button>
                    <button onClick={() => setShowTutorial(true)} className="px-2 py-2 text-xs sm:text-base font-black text-amber-900 bg-white/70 rounded-xl hover:bg-white transition-all border-2 border-white/50 shadow-sm">
                        도움말
                    </button>
                    <button onClick={onReset} className="px-2 py-2 text-xs sm:text-base font-black text-stone-400 bg-transparent rounded-xl hover:text-red-500 transition-all">
                        초기화
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default StartScreen;
