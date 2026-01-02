
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
            soundManager.playBurnt(); // 돈 부족 경고음 대용
        }
    };

    const handleClose = () => {
        soundManager.playClick();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm animate-customer-pop-in"
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-amber-50 rounded-3xl shadow-2xl border-4 border-amber-300 p-6 sm:p-10 w-full max-w-2xl m-4 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-center text-4xl sm:text-5xl font-black text-amber-800 mb-3">가게 업그레이드</h2>
                <div className="text-center mb-6 text-2xl sm:text-3xl font-black text-amber-900 bg-white/50 py-2 rounded-full border-2 border-amber-200">
                    내 재산: ₩{totalRevenue.toLocaleString()}
                </div>

                <div className="space-y-4 mt-2 flex-grow overflow-y-auto pr-3 max-h-[55vh] custom-scrollbar">
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
                                className={`p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 border-2 relative transition-all ${isSpecial ? 'bg-yellow-100 border-yellow-400 shadow-lg' : 'bg-white border-amber-100 hover:border-amber-300 shadow-sm'}`}
                            >
                               {isSpecial && <div className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-full transform rotate-12 shadow-xl z-10 border-2 border-white">할인중!</div>}
                                <div className="flex-grow">
                                    <p className="font-black text-amber-900 text-xl sm:text-2xl mb-1">{config.name}</p>
                                    <p className="text-base sm:text-lg text-stone-500 font-bold">현재: <span className="text-amber-700">{config.description(config.levels[currentLevel].value)}</span></p>
                                </div>
                                <button
                                    onClick={() => handlePurchase(upgradeType)}
                                    disabled={isMaxLevel || (finalCost != null && totalRevenue < finalCost)}
                                    className={`w-36 sm:w-44 py-3 sm:py-4 text-lg sm:text-xl font-black text-white rounded-xl shadow-md transition-all ${isMaxLevel ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                                >
                                    {isMaxLevel ? 'MAX' : 
                                     isSpecial && originalCost ? (
                                        <span className="flex flex-col items-center leading-tight">
                                            <span className="line-through opacity-60 text-sm">₩{originalCost.toLocaleString()}</span>
                                            <span>₩{finalCost?.toLocaleString()}</span>
                                        </span>
                                     ) : `₩${finalCost?.toLocaleString()}`
                                    }
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleClose}
                        className="px-12 py-4 text-2xl font-black text-white bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 active:scale-95 transition-all border-b-4 border-orange-700"
                    >
                        창 닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
