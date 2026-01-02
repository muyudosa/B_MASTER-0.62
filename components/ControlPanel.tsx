
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
        <div className="bg-amber-200 rounded-lg p-3 sm:p-5 flex flex-col items-center justify-center gap-5 border-4 border-amber-400">
            {/* Serving Plate */}
            <div className="flex flex-col items-center gap-3 w-full">
                <h3 className="text-2xl sm:text-3xl font-black text-amber-800">준비된 붕어빵</h3>
                <div className="bg-white w-full max-w-2xl rounded-2xl p-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-2 border-amber-400 shadow-inner">
                    {Object.values(FillingType).map((filling) => {
                        const fillingType = filling as FillingType;
                        const Icon = ICONS[fillingType];
                        const details = FILLING_DETAILS[fillingType];
                        return (
                             <div key={fillingType} className={`flex items-center gap-3 text-xl sm:text-2xl font-black ${details.textColor}`}>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 text-amber-700"><BungeoppangIcon crustLevel={upgrades.BUNGEOPPANG_CRUST} decorationLevel={upgrades.BUNGEOPPANG_DECORATION} /></div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10"><Icon /></div>
                                <span className="tabular-nums">x {servingPlate[fillingType]}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="w-full flex justify-center">
                <button
                    onClick={onCleanAllMolds}
                    className="px-8 py-3 bg-slate-500 text-white text-lg sm:text-xl font-black rounded-full shadow-lg hover:bg-slate-600 transition-all duration-200 transform hover:scale-105"
                >
                    ✨ 틀 전체 청소
                </button>
            </div>
        </div>
    );
};

export default React.memo(ControlPanel);
