
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UpgradeType, Upgrades, DailySpecial, FillingType } from '../types';
import { UPGRADE_CONFIG, LEVEL_CONFIG, BASE_PRICE_PER_BUN, FILLING_DETAILS } from '../constants';
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
    const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const generateHeroImage = useCallback(async () => {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return;

        setIsAiLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey });
            const fillings = Object.values(FillingType);
            const randomFilling = fillings[Math.floor(Math.random() * fillings.length)];
            const fillingName = FILLING_DETAILS[randomFilling].label;

            const prompt = `A single, professional high-quality food photography of a traditional Korean Bungeoppang (fish-shaped bread) filled with ${fillingName}. Golden brown crispy texture. Perfectly centered. ABSOLUTELY NO TEXT, NO LETTERS, NO BORDERS.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: { aspectRatio: "16:9" }
                }
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    setAiImageUrl(`data:image/png;base64,${part.inlineData.data}`);
                    break;
                }
            }
        } catch (error) {
            console.error("AI 이미지 생성 실패:", error);
        } finally {
            setIsAiLoading(false);
        }
    }, []);

    useEffect(() => {
        generateHeroImage();
    }, [generateHeroImage]);

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
        <div className="flex flex-col h-full bg-amber-50 rounded-lg p-2 sm:p-4 overflow-hidden relative font-['Noto_Sans_KR']">
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
            
            {/* Height reduced more for better fit */}
            <div className="w-full h-24 sm:h-32 mb-1 relative flex items-center justify-center flex-shrink-0">
                {aiImageUrl ? (
                    <div className="w-full h-full relative animate-pop-in-subtle overflow-hidden">
                        <img 
                            src={aiImageUrl} 
                            alt="AI Generated Bungeoppang" 
                            className="w-full h-full object-contain pointer-events-none"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="opacity-20 scale-50">
                            <StartScreenAnimation upgrades={upgrades} />
                        </div>
                        {isAiLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-amber-800/60 font-black text-xs animate-pulse tracking-tighter">
                                    준비 중...
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <header className="text-center z-10 relative mb-1 flex-shrink-0">
                <h1 className="text-4xl sm:text-5xl font-black text-amber-900 tracking-tighter" style={{ textShadow: '2px 2px 0px rgba(245, 158, 11, 0.2)' }}>
                    붕어빵 장사
                </h1>
                <p className="text-sm sm:text-lg text-amber-700/70 font-bold italic tracking-tight">나만의 달콤하고 바삭한 이야기</p>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center z-10 relative overflow-hidden">
                <div className="bg-white/70 backdrop-blur-2xl p-4 sm:p-6 rounded-[32px] shadow-[0_15px_40px_-10px_rgba(120,53,15,0.1)] border border-white/50 w-full max-w-sm text-center flex flex-col transform transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="bg-amber-100 text-amber-950 px-3 py-1 rounded-full font-black text-xs sm:text-base tracking-widest">DAY {day}</span>
                        <div className="text-right">
                            <p className="text-[10px] sm:text-xs text-stone-500 font-black uppercase">오늘의 목표</p>
                            <p className="text-xl sm:text-2xl font-black text-green-600 tracking-tighter">₩{levelConfig.goal.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-4">
                        <div className="text-left">
                            <div className="flex justify-between items-center mb-0.5">
                                <p className="font-black text-stone-600 text-base sm:text-lg">장사 시간</p>
                                <p className="text-amber-700 font-black text-lg sm:text-xl">{dayDuration}초</p>
                            </div>
                            <input
                                type="range"
                                min="30"
                                max="180"
                                step="15"
                                value={dayDuration}
                                onChange={(e) => setDayDuration(Number(e.target.value))}
                                className="w-full h-2 bg-amber-100 rounded-full appearance-none cursor-pointer accent-amber-600"
                            />
                        </div>
                         <div className="text-left">
                            <div className="flex justify-between items-center mb-0.5">
                                <p className="font-black text-stone-600 text-base sm:text-lg">판매 가격</p>
                                <p className={`font-black text-lg sm:text-xl ${
                                    priceModifier > 1.0 ? 'text-green-600' : 
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
                                className="w-full h-2 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-600"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleStart}
                        className="w-full py-3 sm:py-4 text-2xl sm:text-3xl font-black text-white bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-[20px] shadow-lg active:scale-95 transition-all tracking-tighter border-b-4 border-orange-800"
                    >
                        장사 시작!
                    </button>
                </div>
            </main>

            <footer className="mt-3 flex flex-col justify-center items-center gap-2 z-10 relative flex-shrink-0">
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                    <button onClick={() => setShowUpgrades(true)} className="px-2 py-3 text-sm sm:text-lg font-black text-amber-900 bg-white/60 rounded-2xl hover:bg-white transition-all border border-white/50">
                        가게 업그레이드
                    </button>
                    <button onClick={() => setShowRecipeBook(true)} className="px-2 py-3 text-sm sm:text-lg font-black text-amber-900 bg-white/60 rounded-2xl hover:bg-white transition-all border border-white/50">
                        붕어빵 도감
                    </button>
                    <button onClick={() => setShowTutorial(true)} className="px-2 py-3 text-sm sm:text-lg font-black text-amber-900 bg-white/60 rounded-2xl hover:bg-white transition-all border border-white/50">
                        게임 방법
                    </button>
                    <button onClick={onReset} className="px-2 py-3 text-sm sm:text-lg font-black text-stone-400 bg-transparent rounded-2xl hover:text-red-500 transition-all">
                        기록 초기화
                    </button>
                </div>
                <div className="opacity-60">
                    <p className="text-[10px] text-stone-400 font-black tracking-widest uppercase">
                        Bungeoppang Tycoon v1.0
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default StartScreen;
