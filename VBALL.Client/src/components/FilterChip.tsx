import React from 'react';
import { CloseIcon } from './Icon';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  onClear?: (e: React.MouseEvent) => void; // Optional clear 'x'
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onClick, onClear }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center justify-center px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200
        border
        ${isActive 
          ? 'bg-[#E8DEF8] border-transparent text-[#1D1B20]' 
          : 'bg-transparent border-[#79747E] text-[#49454F] hover:bg-black/5'
        }
      `}
    >
      {isActive && <span className="mr-1 text-[#1D1B20]">✓</span>}
      {label}
      {isActive && onClear && (
        <span 
          role="button" 
          onClick={(e) => { e.stopPropagation(); onClear(e); }}
          className="ml-2 p-0.5 rounded-full hover:bg-black/10"
        >
          <CloseIcon size={14} />
        </span>
      )}
    </button>
  );
};
