import React from 'react';
import { Match, MatchStatus, Team } from '../types';
import { ArrowLeftIcon } from './Icon';

interface MatchDetailsProps {
  match: Match;
  teamA: Team | null;
  teamB: Team | null;
  onBack: () => void;
}

export const MatchDetails: React.FC<MatchDetailsProps> = ({ match, teamA, teamB, onBack }) => {
  // Formatting
  const startTime = match.startTime instanceof Date 
    ? match.startTime 
    : new Date(match.startTime);
  
  const dateStr = startTime.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  // Status text helper
  const getStatusText = (status: MatchStatus) => {
     switch(status) {
         case MatchStatus.Scheduled: return 'Запланирована';
         case MatchStatus.InProgress: return 'Идет сейчас';
         case MatchStatus.Finished: return 'Завершена';
         case MatchStatus.Cancelled: return 'Отменена';
         default: return '';
     }
  };

  const getStageText = (stage?: string) => {
      switch(stage) {
          case 'Group': return 'Групповой этап';
          case 'Final': return 'Финал';
          case 'StarMatch': return 'Матч звезд';
          default: return 'Матч';
      }
  };

  const teamAName = teamA?.name || `Team ${match.teamAId}`;
  const teamBName = teamB?.name || `Team ${match.teamBId}`;

  return (
    <div className="flex flex-col h-screen bg-[#ECE6F0] text-[#1D1B20]">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4 bg-[#ECE6F0] sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
           <ArrowLeftIcon />
        </button>
        <h1 className="text-2xl font-normal tracking-tight">Игра</h1>
      </header>

      <main className="flex-1 px-4 pt-2 flex flex-col gap-4 overflow-y-auto pb-6">
        {/* Score / Teams Card */}
        <div className="bg-[#F3EDF7] rounded-3xl p-6 flex flex-col items-center shadow-sm">
             <div className="text-sm font-medium text-[#49454F] mb-6 flex items-center gap-2">
                {match.format && <span className="bg-[#E8DEF8] px-2 py-0.5 rounded text-[#1D1B20]">{match.format === '4x4' ? '4×4' : 'Классика'}</span>}
                <span className="text-[#65558F] font-bold">•</span>
                <span>{getStageText(match.stage)}</span>
             </div>

             <div className="flex w-full justify-between items-start mb-8">
                {/* Team A */}
                <div className="flex flex-col items-center w-[40%] text-center gap-2">
                   <div className="w-16 h-16 bg-[#E8DEF8] rounded-2xl flex items-center justify-center text-3xl font-bold text-[#65558F] shadow-sm">
                      {teamAName[0]}
                   </div>
                   <span className="font-bold text-lg leading-tight break-words w-full">{teamAName}</span>
                </div>
                
                {/* Score or VS */}
                <div className="flex flex-col items-center pt-3 w-[20%]">
                    <div className="text-3xl font-black text-[#1D1B20] tracking-wider">
                        {match.finalScore ? match.finalScore : "VS"}
                    </div>
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center w-[40%] text-center gap-2">
                   <div className="w-16 h-16 bg-[#E8DEF8] rounded-2xl flex items-center justify-center text-3xl font-bold text-[#65558F] shadow-sm">
                      {teamBName[0]}
                   </div>
                   <span className="font-bold text-lg leading-tight break-words w-full">{teamBName}</span>
                </div>
             </div>
             
             <div className={`
                px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase
                ${match.status === MatchStatus.Finished 
                    ? 'bg-[#E8DEF8] text-[#1D1B20] border border-[#CAC4D0]' 
                    : match.status === MatchStatus.InProgress
                        ? 'bg-[#B3261E] text-white'
                        : 'bg-[#65558F] text-white shadow-md'
                }
             `}>
                {getStatusText(match.status)}
             </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#F3EDF7] rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-[#65558F] font-bold uppercase text-xs tracking-widest ml-1">Информация</h3>
            
            <div className="flex flex-col gap-1 px-1">
                <span className="text-[#49454F] text-sm">Дата начала</span>
                <span className="text-xl font-medium capitalize">{dateStr}</span>
            </div>
            
            <div className="w-full h-px bg-[#CAC4D0]/50"></div>

            <div className="flex flex-col gap-1 px-1">
                <span className="text-[#49454F] text-sm">Время</span>
                <span className="text-xl font-medium">{timeStr}</span>
            </div>

            {match.finalScore && (
                <>
                <div className="w-full h-px bg-[#CAC4D0]/50"></div>
                <div className="flex flex-col gap-1 px-1">
                    <span className="text-[#49454F] text-sm">Итоговый счет</span>
                    <span className="text-xl font-medium">{match.finalScore}</span>
                </div>
                </>
            )}
        </div>
      </main>
    </div>
  );
};
