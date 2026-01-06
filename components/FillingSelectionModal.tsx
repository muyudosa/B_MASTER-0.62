
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
            className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center backdrop-blur-[2px] transition-opacity duration-100"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white/95 rounded-3xl shadow-2xl border-4 border-amber-300 p-4 sm:p-6 w-full max-w-2xl m-4 transform animate-modal-in"
                onClick={(e) => e.stopPropagation()} 
            >
                <h2 className="text-center text-xl sm:text-3xl font-black text-amber-900 mb-4 tracking-tight">어떤 속을 넣을까요?</h2>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 p-1">
                    {Object.values(FillingType).map((filling) => {
                        const fillingType = filling as FillingType;
                        const details = FILLING_DETAILS[fillingType];
                        const Icon = ICONS[fillingType];
                        return (
                            <button 
                                key={fillingType}
                                onClick={() => onSelect(fillingType)}
                                className="flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-2xl border-2 border-amber-100 bg-amber-50 hover:bg-white hover:border-orange-400 active:scale-95 transform transition-all shadow-sm group"
                            >
                                <div className="w-10 h-10 sm:w-14 sm:h-14 group-hover:scale-110 transition-transform duration-150">
                                    <Icon />
                                </div>
                                <span className={`font-black text-[11px] sm:text-sm whitespace-nowrap ${details.textColor}`}>{details.label}</span>
                            </button>
                        );
                    })}
                </div>
                <button 
                    onClick={onClose}
                    className="mt-4 w-full py-2.5 bg-stone-100 text-stone-500 font-black rounded-xl hover:bg-stone-200 transition-colors text-sm"
                >
                    취소
                </button>
            </div>
        </div>
    );
};

export default FillingSelectionModal;
