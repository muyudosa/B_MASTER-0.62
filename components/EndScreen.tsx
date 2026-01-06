
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
        <div className="flex flex-col items-center justify-center h-full text-center bg-amber-50 rounded-lg p-3 sm:p-5 overflow-hidden font-['Noto_Sans_KR']">
            <h1 className="text-4xl sm:text-6xl font-black mb-1 animate-ready-pulse leading-none tracking-tighter text-amber-900">
                {success ? '성공!' : '아쉬워요!'}
            </h1>
            <p className={`text-lg sm:text-2xl mb-3 font-black ${success ? 'text-emerald-600' : 'text-rose-600'}`}>
                {success ? '수익 목표 달성!' : '내일은 더 힘내요!'}
            </p>
            
            <div className="bg-white p-4 sm:p-5 rounded-[28px] shadow-xl text-stone-700 mb-4 w-full max-w-xl space-y-3 border-4 border-amber-100 flex flex-col">
                 <h2 className="text-xl sm:text-2xl font-black text-amber-900 border-b-2 border-amber-50 pb-2">
                    {day}일차 정산서
                </h2>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm sm:text-lg">
                        <span className="font-bold text-stone-400">목표</span>
                        <span className="font-bold text-stone-800">₩{goal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-400 text-sm sm:text-lg">수익</span>
                        <span className={`font-black text-2xl sm:text-4xl ${success ? 'text-emerald-700' : 'text-rose-700'} tabular-nums`}>₩{revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-0.5 bg-amber-50" />
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-900 text-sm sm:text-lg">총 자산</span>
                        <span className="font-black text-xl sm:text-3xl text-amber-800 tabular-nums">₩{totalRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="flex flex-col items-center bg-amber-50/50 p-2 rounded-xl">
                        <span className="font-bold text-stone-400 text-[10px] sm:text-xs">판매량</span>
                        <div className="flex items-center gap-1 font-black text-lg sm:text-2xl text-amber-800">
                            <div className="w-6 h-6 sm:w-8 sm:h-8"><BungeoppangIcon crustLevel={1} /></div>
                            <span>{bunsSold}개</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center bg-amber-50/50 p-2 rounded-xl">
                        <span className="font-bold text-stone-400 text-[10px] sm:text-xs">만족도</span>
                        <div className="flex items-center gap-1 font-black text-lg sm:text-2xl">
                            <span className={getPatienceColor(avgPatience)}>{getSatisfactionEmoji(avgPatience)}</span>
                            <span className={getPatienceColor(avgPatience)}>{avgPatience}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleProceed}
                className="px-10 py-3 sm:py-4 text-xl sm:text-3xl font-black text-white bg-orange-600 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all border-b-4 border-orange-800 tracking-tighter"
            >
                {success ? '다음으로' : '재시도'}
            </button>
        </div>
    );
};

export default EndScreen;
