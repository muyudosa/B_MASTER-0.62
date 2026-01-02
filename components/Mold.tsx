
import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { Mold, MoldState, ServingPlate, Upgrades } from '../types';
import { BURN_TIME_MS, ICONS } from '../constants';
import { soundManager } from '../utils/soundManager';

interface MoldProps {
    mold: Mold;
    setMolds: React.Dispatch<React.SetStateAction<Mold[]>>;
    addTimeout: (timeout: number) => void;
    setServingPlate: React.Dispatch<React.SetStateAction<ServingPlate>>;
    setFillingTarget: React.Dispatch<React.SetStateAction<number | null>>;
    cookTime: number;
    upgrades: Upgrades;
    isSelected: boolean;
}

const MoldComponent: React.FC<MoldProps> = ({ mold, setMolds, setServingPlate, setFillingTarget, cookTime, upgrades, isSelected }) => {
    const lastState = useRef(mold.state);

    // 상태 변화 감지 및 사운드 재생
    useEffect(() => {
        if (lastState.current !== mold.state) {
            if (mold.state === MoldState.COOKING) soundManager.playSizzle();
            if (mold.state === MoldState.READY) soundManager.playReady();
            if (mold.state === MoldState.BURNT) soundManager.playBurnt();
            lastState.current = mold.state;
        }
    }, [mold.state]);

    const updateMold = useCallback((id: number, updates: Partial<Mold>) => {
        setMolds(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    }, [setMolds]);

    const handleClick = () => {
        soundManager.playClick();
        switch (mold.state) {
            case MoldState.EMPTY:
                setFillingTarget(mold.id);
                break;
            case MoldState.READY:
                if (mold.filling !== null) {
                    setServingPlate(prev => ({ ...prev, [mold.filling]: prev[mold.filling] + 1 }));
                }
                updateMold(mold.id, { state: MoldState.EMPTY, filling: null, progress: 0 });
                break;
            case MoldState.BURNT:
                updateMold(mold.id, { state: MoldState.EMPTY, filling: null, progress: 0 });
                break;
        }
    };

    const getMoldBgColor = () => {
        switch (mold.state) {
            case MoldState.EMPTY: return 'bg-slate-800';
            case MoldState.COOKING: return 'bg-amber-400/10';
            case MoldState.READY: return 'bg-amber-600/20';
            case MoldState.BURNT: return 'bg-stone-950';
        }
    };
    
    const interpolateColor = (ratio: number, startRGB: number[], endRGB: number[]) => {
        const r = Math.round(startRGB[0] + (endRGB[0] - startRGB[0]) * ratio);
        const g = Math.round(startRGB[1] + (endRGB[1] - startRGB[1]) * ratio);
        const b = Math.round(startRGB[2] + (endRGB[2] - startRGB[2]) * ratio);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const progressInfo = useMemo(() => {
        let percentage = 0;
        let color = 'rgb(34, 197, 94)'; 
        let isCritical = false;

        const green = [34, 197, 94];
        const yellow = [234, 179, 8];
        const orange = [249, 115, 22];
        const red = [239, 68, 68];

        if (mold.state === MoldState.COOKING) {
            const ratio = Math.max(0, Math.min(1, 1 - (mold.progress / cookTime)));
            percentage = ratio * 100;
            color = interpolateColor(ratio, green, yellow);
        } else if (mold.state === MoldState.READY) {
            const ratio = Math.max(0, Math.min(1, 1 - (mold.progress / BURN_TIME_MS)));
            percentage = ratio * 100;
            
            if (ratio < 0.5) {
                color = interpolateColor(ratio * 2, yellow, orange);
            } else {
                color = interpolateColor((ratio - 0.5) * 2, orange, red);
            }
            
            if (ratio > 0.7) {
                isCritical = true;
                // 타기 직전 경고음 (매초 틱마다 작게 재생할 수도 있음)
            }
        }
        
        return { 
            width: `${percentage}%`, 
            color,
            isCritical
        };
    }, [mold.state, mold.progress, cookTime]);

    const BungeoppangIcon = ICONS.BUNGEOPPANG;
    const isActuallySelected = mold.state === MoldState.EMPTY && isSelected;

    return (
        <div 
            className={`relative rounded-xl flex items-center justify-center cursor-pointer transform transition-all duration-150 hover:scale-105 shadow-lg overflow-hidden border-2 border-slate-700/50 ${getMoldBgColor()} ${isActuallySelected ? 'glow-on-select' : ''} ${mold.state === MoldState.READY ? 'glow-ready' : ''}`}
            onClick={handleClick}
        >
            <div className="w-2/3 h-2/3 text-slate-600/30">
                <BungeoppangIcon />
            </div>

            {mold.state === MoldState.COOKING && mold.filling && (() => {
                const FillingIcon = ICONS[mold.filling];
                return (
                    <>
                        <div className="absolute text-amber-900/40 scale-110"><BungeoppangIcon /></div>
                        <div className="absolute w-1/3 h-1/3 opacity-80"><FillingIcon /></div>
                    </>
                );
            })()}

            {mold.state === MoldState.READY && mold.filling && (
                 <>
                    <div className="absolute text-amber-800 animate-gentle-bob animate-ready-pulse">
                        <BungeoppangIcon crustLevel={upgrades.BUNGEOPPANG_CRUST} decorationLevel={upgrades.BUNGEOPPANG_DECORATION} />
                    </div>
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="sparkle" style={{ top: '20%', left: '30%', animationDelay: '0s' }}></div>
                        <div className="sparkle" style={{ top: '65%', left: '70%', animationDelay: '0.5s' }}></div>
                    </div>
                 </>
            )}

            {mold.state === MoldState.BURNT && (
                <>
                    <div className="absolute text-stone-800 scale-105 opacity-60"><BungeoppangIcon /></div>
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="smoke" style={{ top: '50%', left: '45%', animationDelay: '0s' }}></div>
                        <div className="smoke" style={{ top: '40%', left: '30%', animationDelay: '1s' }}></div>
                    </div>
                </>
            )}

            {(mold.state === MoldState.COOKING || mold.state === MoldState.READY) && (
                <div className="absolute bottom-0 left-0 w-full h-2.5 bg-black/40 backdrop-blur-sm">
                    <div
                        className={`h-full ${progressInfo.isCritical ? 'animate-pulse' : ''}`}
                        style={{ 
                            width: progressInfo.width, 
                            backgroundColor: progressInfo.color,
                            boxShadow: `0 0 10px ${progressInfo.color}`,
                            transition: 'none'
                        }}
                    ></div>
                </div>
            )}
            
            {progressInfo.isCritical && (
                <div className="absolute top-1 right-1 text-[10px] font-bold text-red-500 animate-bounce bg-black/50 px-1 rounded shadow-lg">
                    !위험!
                </div>
            )}
        </div>
    );
};

export default React.memo(MoldComponent);
