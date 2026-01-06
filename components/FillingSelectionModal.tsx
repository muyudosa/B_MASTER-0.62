
import React from 'react';
import { FillingType } from '../types';
import { ICONS, FILLING_DETAILS } from '../constants';

interface FillingSelectionModalProps {
    isOpen: boolean;
    onSelect: (filling: FillingType) => void;
    onClose: () => void;
}

const FillingSelectionModal: React.FC<FillingSelectionModalProps> = ({ isOpen, onSelect, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center backdrop-blur-[2px] p-2"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-[24px] shadow-2xl border-4 border-amber-300 p-3 sm:p-5 w-full max-w-xl transform animate-modal-in"
                onClick={(e) => e.stopPropagation()} 
            >
                <h2 className="text-center text-lg sm:text-2xl font-black text-amber-900 mb-3">속 재료 선택</h2>
                <div className="grid grid-cols-4 gap-2">
                    {Object.values(FillingType).map((filling) => {
                        const fillingType = filling as FillingType;
                        const details = FILLING_DETAILS[fillingType];
                        const Icon = ICONS[fillingType];
                        return (
                            <button 
                                key={fillingType}
                                onClick={() => onSelect(fillingType)}
                                className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 rounded-xl border-2 border-amber-100 bg-amber-50 hover:border-orange-400 active:scale-90 transition-all group"
                            >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform">
                                    <Icon />
                                </div>
                                <span className={`font-black text-[10px] sm:text-xs truncate w-full text-center ${details.textColor}`}>{details.label}</span>
                            </button>
                        );
                    })}
                </div>
                <button 
                    onClick={onClose}
                    className="mt-3 w-full py-2 bg-stone-100 text-stone-500 font-black rounded-xl hover:bg-stone-200 transition-colors text-xs"
                >
                    취소
                </button>
            </div>
        </div>
    );
};

export default FillingSelectionModal;
