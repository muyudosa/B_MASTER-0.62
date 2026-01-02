
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
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm transition-opacity duration-200"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white/95 rounded-2xl shadow-2xl border-4 border-amber-300 p-6 w-full max-w-md m-4 transform animate-customer-pop-in"
                onClick={(e) => e.stopPropagation()} 
            >
                <h2 className="text-center text-3xl font-bold text-amber-800 mb-6">어떤 속을 넣을까요?</h2>
                <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2">
                    {Object.values(FillingType).map((filling) => {
                        const fillingType = filling as FillingType;
                        const details = FILLING_DETAILS[fillingType];
                        const Icon = ICONS[fillingType];
                        return (
                            <button 
                                key={fillingType}
                                onClick={() => onSelect(fillingType)}
                                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-4 border-amber-200 bg-amber-50 hover:bg-white hover:border-orange-400 hover:scale-105 transform transition-all shadow-md group"
                            >
                                <div className="w-16 h-16 group-hover:animate-icon-pop">
                                    <Icon />
                                </div>
                                <span className={`font-bold text-lg ${details.textColor}`}>{details.label}</span>
                            </button>
                        );
                    })}
                </div>
                <button 
                    onClick={onClose}
                    className="mt-6 w-full py-3 bg-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-300 transition-colors"
                >
                    취소
                </button>
            </div>
        </div>
    );
};

export default FillingSelectionModal;
