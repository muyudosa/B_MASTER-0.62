
import React from 'react';
import { UpgradeType, Upgrades, DailySpecial } from '../types';
import { UPGRADE_CONFIG } from '../constants';
import { soundManager } from '../utils/soundManager';

interface UpgradeModalProps {
    totalRevenue: number;
    upgrades: Upgrades;
    onPurchaseUpgrade: (upgradeType: UpgradeType) => void;
    onClose: () => void;
    dailySpecial: DailySpecial | null;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ totalRevenue, upgrades, onPurchaseUpgrade, onClose, dailySpecial }) => {
    const handlePurchase = (upgradeType: UpgradeType) => {
        const currentLevel = upgrades[upgradeType] || 0;
        const config = UPGRADE_CONFIG[upgradeType];
        const nextLevelInfo = config.levels[currentLevel + 1];
        if (!nextLevelInfo) return;

        let finalCost = nextLevelInfo.cost;
        if (dailySpecial?.type === 'UPGRADE_DISCOUNT' && dailySpecial.target === upgradeType) {
            finalCost = Math.floor(finalCost * dailySpecial.value);
        }

        if (totalRevenue >= finalCost) {
            soundManager.playUpgrade();
            onPurchaseUpgrade(upgradeType);
        } else {
            soundManager.playBurnt(); 
        }
    };

    const handleClose = () => {
        soundManager.playClick();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-md animate-customer-pop-in p-2 sm:p-4"
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-amber-50 rounded-[32px] sm:rounded-[48px] shadow-2xl border-4 sm:border-8 border-amber-400 p-4 sm:p-8 w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-center text-3xl sm:text-5xl font-black text-amber-900 mb-2 sm:mb-4 drop-shadow-sm">상점</h2>
                <div className="text-center mb-4 sm:mb-6 text-xl sm:text-3xl font-black text-emerald-700 bg-white/80 py-2 sm:py-3 rounded-[20px] sm:rounded-[32px] border-2 border-amber-200 shadow-inner tabular-nums">
                    보유 금액: ₩{totalRevenue.toLocaleString()}
                </div>

                <div className="space-y-3 sm:space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(UPGRADE_CONFIG).map(([key, config]) => {
                        const upgradeType = key as UpgradeType;
                        const currentLevel = upgrades[upgradeType] || 0;
                        const isMaxLevel = currentLevel >= config.levels.length - 1;
                        const nextLevelInfo = !isMaxLevel ? config.levels[currentLevel + 1] : null;
                        
                        const isSpecial = dailySpecial?.type === 'UPGRADE_DISCOUNT' && dailySpecial.target === upgradeType;
                        const originalCost = nextLevelInfo?.cost;
                        const finalCost = isSpecial && originalCost ? Math.floor(originalCost * dailySpecial.value) : originalCost;

                        return (
                            <div 
                                key={upgradeType} 
                                className={`p-3 sm:p-5 rounded-[20px] sm:rounded-[28px] flex items-center justify-between gap-3 sm:gap-6 border-2 relative transition-all ${isSpecial ? 'bg-yellow-100 border-yellow-500 shadow-lg' : 'bg-white border-amber-100 hover:border-amber-400 shadow-sm'}`}
                            >
                               {isSpecial && <div className="absolute -top-3 -right-2 bg-rose-600 text-white text-[10px] sm:text-sm font-black px-3 py-1 rounded-full transform rotate-12 shadow-md z-10 border-2 border-white animate-bounce">세일 중!</div>}
                                <div className="flex-grow min-w-0">
                                    <p className="font-black text-amber-950 text-lg sm:text-2xl truncate mb-0.5">{config.name}</p>
                                    <p className="text-xs sm:text-base text-stone-500 font-bold leading-tight">
                                        현재: <span className="text-amber-800">{config.description(config.levels[currentLevel].value)}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => handlePurchase(upgradeType)}
                                    disabled={isMaxLevel || (finalCost != null && totalRevenue < finalCost)}
                                    className={`min-w-[90px] sm:min-w-[140px] py-2 sm:py-3 px-2 text-sm sm:text-xl font-black text-white rounded-[14px] sm:rounded-[18px] shadow-md transition-all border-b-4 ${isMaxLevel ? 'bg-stone-400 border-stone-600 cursor-not-allowed opacity-50' : (finalCost != null && totalRevenue < finalCost ? 'bg-stone-400 border-stone-600 grayscale' : 'bg-emerald-600 border-emerald-800 hover:brightness-110 active:translate-y-0.5 active:border-b-2')}`}
                                >
                                    {isMaxLevel ? 'Max' : 
                                     isSpecial && originalCost ? (
                                        <span className="flex flex-col items-center leading-none">
                                            <span className="line-through opacity-60 text-[10px] sm:text-xs">₩{originalCost.toLocaleString()}</span>
                                            <span>₩{finalCost?.toLocaleString()}</span>
                                        </span>
                                     ) : `₩${finalCost?.toLocaleString()}`
                                    }
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 sm:mt-6 text-center">
                    <button
                        onClick={handleClose}
                        className="px-8 sm:px-12 py-3 sm:py-4 text-xl sm:text-3xl font-black text-white bg-orange-600 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all border-b-[6px] sm:border-b-[8px] border-orange-800"
                    >
                        나가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
