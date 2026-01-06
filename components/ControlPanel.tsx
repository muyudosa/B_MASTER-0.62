
import React from 'react';
import { FillingType, ServingPlate, Upgrades } from '../types';
import { ICONS, FILLING_DETAILS } from '../constants';

interface ControlPanelProps {
    servingPlate: ServingPlate;
    upgrades: Upgrades;
    onCleanAllMolds: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ servingPlate, upgrades, onCleanAllMolds }) => {
    const BungeoppangIcon = ICONS.BUNGEOPPANG;

    return (
        <div className="bg-amber-100 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center gap-2 border-4 border-amber-300 shadow-md">
            {/* Serving Plate */}
            <div className="flex flex-col items-center gap-1 w-full">
                <h3 className="text-lg sm:text-xl font-black text-amber-900">준비된 붕어빵</h3>
                <div className="bg-white/80 w-full rounded-xl p-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-2 border-amber-200 shadow-inner">
                    {Object.values(FillingType).map((filling) => {
                        const fillingType = filling as FillingType;
                        const Icon = ICONS[fillingType];
                        const details = FILLING_DETAILS[fillingType];
                        if (servingPlate[fillingType] === 0) return null; // 0개는 표시하지 않음 (공간 절약)
                        return (
                             <div key={fillingType} className={`flex items-center gap-1.5 text-base sm:text-lg font-black ${details.textColor}`}>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 text-amber-700"><BungeoppangIcon crustLevel={upgrades.BUNGEOPPANG_CRUST} decorationLevel={upgrades.BUNGEOPPANG_DECORATION} /></div>
                                <div className="w-6 h-6 sm:w-8 sm:h-8"><Icon /></div>
                                <span className="tabular-nums">x{servingPlate[fillingType]}</span>
                            </div>
                        );
                    })}
                    {Object.values(servingPlate).every(v => v === 0) && (
                        <span className="text-stone-400 text-sm font-bold py-1">준비된 빵이 없습니다.</span>
                    )}
                </div>
            </div>
            <div className="w-full flex justify-center">
                <button
                    onClick={onCleanAllMolds}
                    className="px-6 py-1.5 bg-slate-600 text-white text-sm sm:text-base font-black rounded-full shadow active:scale-95 transition-all border-b-4 border-slate-800"
                >
                    ✨ 전체 청소
                </button>
            </div>
        </div>
    );
};

export default React.memo(ControlPanel);
