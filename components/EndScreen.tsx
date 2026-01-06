
import React from 'react';
import { FillingType } from '../types';
import { ICONS, FILLING_DETAILS } from '../constants';

interface EndScreenProps {
    result: {
        revenue: number;
        goal: number;
        success: boolean;
        bunsSold: number;
        avgPatience: number;
        mostPopularFilling: FillingType | null;
        fillingsSold: Partial<Record<FillingType, number>>;
    };
    totalRevenue: number;
    onProceed: () => void;
    day: number;
}

const EndScreen: React.FC<EndScreenProps> = ({ result, totalRevenue, onProceed, day }) => {
    const { revenue, goal, success, bunsSold, avgPatience, mostPopularFilling, fillingsSold } = result;

    const handleProceed = () => {
        onProceed();
    }
    
    const getSatisfactionEmoji = (patience: number) => {
        if (patience > 80) return '😍';
        if (patience > 50) return '😊';
        if (patience > 25) return '😐';
        return '😠';
    };

    const getPatienceColor = (patience: number) => {
        if (patience > 50) return 'text-emerald-500';
        if (patience > 25) return 'text-amber-500';
        return 'text-rose-500';
    };

    const BungeoppangIcon = ICONS.BUNGEOPPANG;

    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-amber-50 rounded-lg p-4 sm:p-6 overflow-hidden font-['Noto_Sans_KR']">
            <h1 className="text-5xl sm:text-7xl font-black mb-2 animate-ready-pulse leading-none tracking-tighter text-amber-900" style={{ textShadow: '4px 4px 0px rgba(217, 119, 6, 0.2)' }}>
                {success ? '성공!' : '아쉬워요!'}
            </h1>
            <p className={`text-xl sm:text-3xl mb-4 font-black italic ${success ? 'text-emerald-600' : 'text-rose-600'} drop-shadow-sm`}>
                {success ? '대박 났어요!' : '내일은 꼭...'}
            </p>
            
            <div className="bg-white/90 p-4 sm:p-6 rounded-[32px] shadow-xl text-lg sm:text-xl text-stone-700 mb-6 w-full max-w-2xl space-y-4 border-4 border-amber-100 flex flex-col">
                 <h2 className="text-2xl sm:text-3xl font-black text-amber-900 text-center mb-2 border-b-4 border-amber-50 pb-2">
                    {day}일차 정산 보고서
                </h2>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-2">
                        <span className="font-black text-stone-400 text-sm sm:text-lg uppercase">목표 금액</span>
                        <span className="font-black text-xl sm:text-3xl text-stone-800">₩{goal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <span className="font-black text-stone-400 text-sm sm:text-lg uppercase">최종 수익</span>
                        <span className={`font-black text-3xl sm:text-5xl ${success ? 'text-emerald-700' : 'text-rose-700'} tabular-nums`}>₩{revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-1 bg-amber-50 rounded-full" />
                    <div className="flex justify-between items-center px-2">
                        <span className="font-black text-amber-900 text-sm sm:text-lg uppercase">전체 재산</span>
                        <span className="font-black text-2xl sm:text-4xl text-amber-800 tabular-nums">₩{totalRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <hr className="my-2 border-amber-100 border-dashed border-2" />

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center bg-amber-50/50 p-3 rounded-2xl">
                        <span className="font-black text-stone-400 text-xs sm:text-sm mb-1">판매량</span>
                        <div className="flex items-center gap-2 font-black text-xl sm:text-3xl text-amber-800">
                            <div className="w-8 h-8 sm:w-10 sm:h-10"><BungeoppangIcon crustLevel={1} /></div>
                            <span>{bunsSold}개</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center bg-amber-50/50 p-3 rounded-2xl">
                        <span className="font-black text-stone-400 text-xs sm:text-sm mb-1">만족도</span>
                        <div className="flex items-center gap-2 font-black text-xl sm:text-3xl">
                            <span className={getPatienceColor(avgPatience)}>{getSatisfactionEmoji(avgPatience)}</span>
                            <span className={getPatienceColor(avgPatience)}>{avgPatience}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleProceed}
                className="px-12 py-4 sm:py-5 text-2xl sm:text-4xl font-black text-white bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all border-b-[8px] border-orange-800 tracking-tighter"
            >
                {success ? '다음 단계로!' : '재도전 하기'}
            </button>
        </div>
    );
};

export default EndScreen;
