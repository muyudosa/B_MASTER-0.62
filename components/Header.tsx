
import React from 'react';
import { DailySpecial } from '../types';

interface HeaderProps {
    day: number;
    timeLeft: number;
    revenue: number;
    goal: number;
    dailySpecial: DailySpecial | null;
}

const Header: React.FC<HeaderProps> = ({ day, timeLeft, revenue, goal, dailySpecial }) => {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = Math.min((revenue / goal) * 100, 100);

    return (
        <div className="bg-amber-800 text-white rounded-lg shadow-xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center text-2xl sm:text-4xl font-black border-4 border-amber-900 gap-4 sm:gap-8 flex-wrap">
            <div className="flex items-center gap-8">
                <span className="tracking-tighter">{day}일차</span>
                <span className="text-yellow-300 drop-shadow-md">{formatTime(timeLeft)}</span>
            </div>
            {dailySpecial && (
                <div className="order-last sm:order-none text-xl sm:text-2xl px-6 py-2 bg-yellow-300 text-yellow-900 rounded-full animate-pulse shadow-lg whitespace-nowrap font-black border-2 border-yellow-500">
                    🌟 {dailySpecial.description}
                </div>
            )}
            <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto sm:min-w-[400px]">
                <span className="flex-shrink-0 tabular-nums">₩{revenue.toLocaleString()}</span>
                <div className="w-full bg-amber-600 rounded-full h-8 sm:h-10 border-4 border-amber-950 overflow-hidden shadow-inner">
                    <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Header);
