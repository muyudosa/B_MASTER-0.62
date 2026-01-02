
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
        if (patience > 50) return 'text-green-500';
        if (patience > 25) return 'text-yellow-500';
        return 'text-red-500';
    };

    const sortedFillings = Object.entries(fillingsSold)
        .filter((entry): entry is [FillingType, number] => typeof entry[1] === 'number' && entry[1] > 0)
        .sort(([, a], [, b]) => b - a);

    const maxSold = sortedFillings.length > 0 ? sortedFillings[0][1] : 0;

    const BungeoppangIcon = ICONS.BUNGEOPPANG;

    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-amber-50 rounded-lg p-5 sm:p-10 overflow-y-auto font-['Noto_Sans_KR']">
            <h1 className="text-6xl sm:text-9xl font-black mb-6 animate-ready-pulse" style={{ textShadow: '4px 4px #d97706' }}>
                {success ? '성공!' : '아쉬워요!'}
            </h1>
            <p className={`text-3xl sm:text-5xl mb-10 font-bold ${success ? 'text-green-600' : 'text-red-600'}`}>
                {success ? '오늘 장사도 대박!' : '목표 달성 실패...'}
            </p>
            
            <div className="bg-white/80 p-8 sm:p-12 rounded-[40px] shadow-2xl text-xl sm:text-2xl text-stone-700 mb-12 w-full max-w-3xl space-y-6 border border-amber-200">
                 <h2 className="text-4xl sm:text-5xl font-black text-amber-800 text-center mb-8 border-b-4 border-amber-200 pb-4">
                    Day {day} 정산
                </h2>
                {/* Revenue section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-500">오늘의 목표:</span>
                        <span className="font-black text-3xl">₩{goal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-500">오늘의 수익:</span>
                        <span className={`font-black text-4xl ${success ? 'text-green-700' : 'text-red-700'}`}>₩{revenue.toLocaleString()}</span>
                    </div>
                    <hr className="my-4 border-stone-200"/>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-500">누적 수익:</span>
                        <span className="font-black text-4xl text-amber-800">₩{totalRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <hr className="my-8 border-amber-300 border-dashed" />

                {/* General Stats section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-500">판매 개수:</span>
                        <div className="flex items-center gap-3 font-black text-3xl">
                            <div className="w-10 h-10 text-amber-700"><BungeoppangIcon crustLevel={0} decorationLevel={0} /></div>
                            <span>{bunsSold}개</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-500">평균 만족도:</span>
                        <div className="flex items-center gap-3 font-black text-3xl">
                            <span className={getPatienceColor(avgPatience)}>{getSatisfactionEmoji(avgPatience)}</span>
                            <span className={getPatienceColor(avgPatience)}>{avgPatience}%</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center sm:col-span-2">
                        <span className="font-bold text-stone-500">오늘의 효자 메뉴:</span>
                        {mostPopularFilling ? (() => {
                            const PopularIcon = ICONS[mostPopularFilling];
                            return (
                                <div className="flex items-center gap-3 font-black text-3xl">
                                    <div className="w-10 h-10"><PopularIcon /></div>
                                    <span className={FILLING_DETAILS[mostPopularFilling].textColor}>{FILLING_DETAILS[mostPopularFilling].label}</span>
                                </div>
                            );
                        })() : (
                            <span className="font-black text-stone-400">없음</span>
                        )}
                    </div>
                </div>

                <hr className="my-8 border-amber-300 border-dashed" />

                {/* Sales Chart section */}
                <div>
                    <h3 className="text-2xl font-black text-amber-800 mb-6 text-center">판매 상세 현황</h3>
                    {sortedFillings.length > 0 ? (
                        <div className="space-y-4 text-left">
                            {sortedFillings.map(([filling, count]) => {
                                const details = FILLING_DETAILS[filling as FillingType];
                                const barWidth = maxSold > 0 ? (count / maxSold) * 100 : 0;
                                const FillingIcon = ICONS[filling as FillingType];
                                return (
                                    <div key={filling} className="grid grid-cols-[3rem_7rem_1fr] items-center gap-4 text-xl">
                                        <div className="w-10 h-10 flex items-center justify-center"><FillingIcon /></div>
                                        <div className={`font-black ${details.textColor}`}>{details.label}</div>
                                        <div className="flex-grow bg-amber-100 rounded-full h-8 flex items-center overflow-hidden">
                                            <div 
                                                className="bg-amber-500 h-full rounded-full text-right pr-4 text-white font-black text-lg flex items-center justify-end transition-all duration-700 ease-out shadow-md"
                                                style={{ width: `${barWidth}%`, minWidth: '40px' }}
                                            >
                                                <span>{count}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-stone-400 text-xl py-4 font-bold">판매 데이터 없음</p>
                    )}
                </div>
            </div>

            <button
                onClick={handleProceed}
                className="px-12 py-5 text-4xl sm:px-16 sm:py-7 sm:text-5xl font-black text-white bg-orange-500 rounded-full shadow-[0_15px_30px_-5px_rgba(234,88,12,0.4)] hover:bg-orange-600 transform hover:scale-105 active:scale-95 transition-all duration-300 border-b-8 border-orange-700 tracking-tighter"
            >
                {success ? '다음으로 이동!' : '다시 도전!'}
            </button>
        </div>
    );
};

export default EndScreen;
