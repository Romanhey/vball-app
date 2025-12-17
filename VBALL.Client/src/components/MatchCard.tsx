import React from 'react';
import { Match, Team } from '../types';
import { CheckIcon } from './Icon';

interface MatchCardProps {
  match: Match;
  teams: Record<number, Team>;
  isSelected: boolean;
  onToggle: (id: number) => void;
  onClick: (id: number) => void;
  readonly?: boolean;
  disabled?: boolean;
  statusBadge?: string;
  statusTone?: 'neutral' | 'success' | 'warning' | 'danger';
}

export const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  teams, 
  isSelected, 
  onToggle, 
  onClick, 
  readonly = false,
  disabled = false,
  statusBadge,
  statusTone = 'neutral',
}) => {
  const teamA = teams[match.teamAId];
  const teamB = teams[match.teamBId];

  // Helper to format time HH:mm
  const startTime = match.startTime instanceof Date 
    ? match.startTime 
    : new Date(match.startTime);
  
  const timeString = startTime.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Construct label like "Storm - Varyagi"
  const teamAName = teamA?.name || `Team ${match.teamAId}`;
  const teamBName = teamB?.name || `Team ${match.teamBId}`;
  const title = `${teamAName} - ${teamBName}`;
  // Add format suffix if needed, as seen in screenshot "Storm - Varyagi(4x4)"
  const displayTitle = match.format === '4x4' ? `${title}(4x4)` : title;

  const toneClasses: Record<'neutral' | 'success' | 'warning' | 'danger', string> = {
    neutral: 'bg-[#E8DEF8] text-[#65558F]',
    success: 'bg-[#C8E6C9] text-[#256029]',
    warning: 'bg-[#FFF3CD] text-[#8B6C00]',
    danger: 'bg-[#FDE7E9] text-[#B3261E]',
  };

  return (
    <div
      className={`
        relative flex items-center justify-between mb-2 rounded-lg 
        transition-colors duration-200 select-none border border-transparent
        ${isSelected ? 'bg-[#E8DEF8]' : 'bg-[#F3EDF7] hover:bg-[#EADDFF]'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      {statusBadge && (
        <span
          className={`
            absolute right-3 top-2 text-[11px] font-semibold px-2 py-0.5 rounded-full
            ${toneClasses[statusTone]}
          `}
        >
          {statusBadge}
        </span>
      )}
      {/* Clickable body for details navigation */}
      <div 
        className={`flex-1 flex flex-col p-3 cursor-pointer ${readonly ? 'pr-3' : ''}`}
        onClick={() => !disabled && onClick(match.matchId)}
      >
        <div className="flex justify-between items-center">
             <span className="text-[#1D1B20] text-[15px] font-medium leading-tight">
              {displayTitle}
            </span>
            {/* Show score in list if available and readonly (history mode) */}
            {readonly && match.finalScore && (
                 <span className="text-[#65558F] font-bold text-sm ml-2 bg-[#E8DEF8] px-2 py-0.5 rounded">
                     {match.finalScore}
                 </span>
            )}
        </div>
       
        <span className="text-[#1D1B20] text-sm mt-1">
          {timeString}
        </span>
      </div>

      {/* Discrete clickable area for selection toggle - Only show if not read only */}
      {!readonly && (
        <div 
            className="flex items-center px-3 py-3 cursor-pointer h-full"
            onClick={(e) => {
            e.stopPropagation();
            if (disabled) {
              return;
            }
            onToggle(match.matchId);
            }}
        >
            <div 
            className={`
                w-6 h-6 rounded flex items-center justify-center border-2 transition-colors
                ${isSelected 
                ? 'bg-[#65558F] border-[#65558F]' 
                : 'border-[#49454F] bg-transparent'
                }
            `}
            >
            {isSelected && <CheckIcon />}
            </div>
        </div>
      )}
    </div>
  );
};
