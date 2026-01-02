
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
        <div className="bg-amber-800 text-white rounded-lg shadow-md p-3 sm:p-5 flex flex-col sm:flex-row justify-between items-center text-xl sm:text-2xl md:text-3xl font-black border-4 border-amber-900 gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-6">
                <span>Day {day}</span>
                <span className="text-yellow-300">{formatTime(timeLeft)}</span>
            </div>
            {dailySpecial && (
                <div className="order-last sm:order-none text-lg sm:text-xl px-4 py-1.5 bg-yellow-300 text-yellow-900 rounded-full animate-pulse shadow-md whitespace-nowrap font-bold">
                    🌟 {dailySpecial.description}
                </div>
            )}
            <div className="flex items-center space-x-3 sm:space-x-5 w-full sm:w-auto sm:min-w-[300px] md:min-w-[350px]">
                <span className="flex-shrink-0">₩{revenue.toLocaleString()}</span>
                <div className="w-full bg-amber-600 rounded-full h-6 sm:h-8 border-2 border-amber-900 overflow-hidden">
                    <div
                        className="bg-green-400 h-full rounded-full transition-all duration-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Header);
