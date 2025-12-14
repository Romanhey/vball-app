import React, { useState } from 'react';
import { Match, MatchStatus, Team, PlayerProfile } from '../types';
import { MenuIcon } from './Icon';

interface ProfilePageProps {
  profile: PlayerProfile | null;
  historyMatches: Match[];
  teams: Record<number, Team>;
  onOpenMenu: () => void;
  onMatchClick: (id: number) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  profile, 
  historyMatches, 
  teams,
  onOpenMenu, 
  onMatchClick 
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY'>('DETAILS');

  // Ensure only finished matches are shown in history
  const finishedMatches = historyMatches.filter(m => m.status === MatchStatus.Finished);

  if (!profile) {
    return (
      <div className="flex flex-col h-full bg-[#ECE6F0]">
        <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#ECE6F0] z-10 shrink-0">
          <button 
            onClick={onOpenMenu}
            className="p-2 -ml-2 rounded-full hover:bg-black/5"
          >
            <MenuIcon />
          </button>
          <h1 className="text-2xl font-normal tracking-tight text-[#1D1B20]">Профиль</h1>
          <div className="w-10"></div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#ECE6F0]">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#ECE6F0] z-10 shrink-0">
          <button 
            onClick={onOpenMenu}
            className="p-2 -ml-2 rounded-full hover:bg-black/5"
          >
            <MenuIcon />
          </button>
          <h1 className="text-2xl font-normal tracking-tight text-[#1D1B20]">Профиль</h1>
          <div className="w-10"></div> {/* Spacer for balance */}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-6">
          
          {/* Profile Summary Card */}
          <div className="bg-[#F3EDF7] rounded-3xl p-6 flex flex-col items-center mb-6 shadow-sm border border-white/40">
              <div className="w-24 h-24 bg-[#65558F] rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-md">
                  {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="text-xl font-bold text-[#1D1B20] text-center">{profile.name}</h2>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-[#E8DEF8] rounded-xl mb-6 shrink-0">
              <button 
                onClick={() => setActiveTab('DETAILS')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'DETAILS' ? 'bg-white text-[#65558F] shadow-sm' : 'text-[#49454F] hover:bg-white/50'}`}
              >
                  Данные
              </button>
              <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'HISTORY' ? 'bg-white text-[#65558F] shadow-sm' : 'text-[#49454F] hover:bg-white/50'}`}
              >
                  История игр
              </button>
          </div>

          {/* Content */}
          {activeTab === 'DETAILS' ? (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  {/* Stats Grid (Simplified) */}
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-2xl p-3 flex flex-col items-center shadow-sm">
                          <span className="text-2xl font-bold text-[#65558F]">{profile.gamesPlayed}</span>
                          <span className="text-[10px] uppercase font-bold text-[#49454F] tracking-wide mt-1">Игр</span>
                      </div>
                      <div className="bg-white rounded-2xl p-3 flex flex-col items-center shadow-sm">
                          <span className="text-2xl font-bold text-[#65558F]">{profile.winRate}%</span>
                          <span className="text-[10px] uppercase font-bold text-[#49454F] tracking-wide mt-1">Побед</span>
                      </div>
                  </div>

                  {/* Personal Details List */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm mt-2 flex flex-col gap-4">
                      <h3 className="text-xs font-bold text-[#65558F] uppercase tracking-widest mb-1">Личные данные</h3>
                      
                      <div className="flex justify-between items-center border-b border-[#CAC4D0]/30 pb-2">
                          <span className="text-[#49454F] text-sm">Телефон</span>
                          <span className="text-[#1D1B20] font-medium">{profile.phone}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#CAC4D0]/30 pb-2">
                          <span className="text-[#49454F] text-sm">Email</span>
                          <span className="text-[#1D1B20] font-medium">{profile.email}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#CAC4D0]/30 pb-2">
                          <span className="text-[#49454F] text-sm">Возраст</span>
                          <span className="text-[#1D1B20] font-medium">{profile.age} лет</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[#49454F] text-sm">Рост</span>
                          <span className="text-[#1D1B20] font-medium">{profile.height} см</span>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                  {finishedMatches.length === 0 ? (
                       <div className="text-center py-8 text-gray-500">История игр пуста</div>
                  ) : (
                      <table className="w-full text-sm text-left">
                          <thead className="text-xs text-[#49454F] uppercase bg-[#F3EDF7] border-b border-[#CAC4D0]">
                              <tr>
                                  <th className="px-4 py-3 font-medium">Дата</th>
                                  <th className="px-4 py-3 font-medium">Игра</th>
                                  <th className="px-4 py-3 font-medium text-right">Счет</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-[#CAC4D0]/30">
                              {finishedMatches.map((match) => {
                                  const teamA = teams[match.teamAId]?.name || `Team ${match.teamAId}`;
                                  const teamB = teams[match.teamBId]?.name || `Team ${match.teamBId}`;
                                  
                                  const startTime = match.startTime instanceof Date 
                                    ? match.startTime 
                                    : new Date(match.startTime);
                                  
                                  // Manual formatting for strict DD.MM
                                  const day = startTime.getDate().toString().padStart(2, '0');
                                  const month = (startTime.getMonth() + 1).toString().padStart(2, '0');
                                  const dateStr = `${day}.${month}`;

                                  return (
                                    <tr 
                                      key={match.matchId} 
                                      onClick={() => onMatchClick(match.matchId)}
                                      className="hover:bg-black/5 cursor-pointer transition-colors"
                                    >
                                        <td className="px-4 py-3 text-[#49454F]">{dateStr}</td>
                                        <td className="px-4 py-3 text-[#1D1B20] font-medium">
                                            {teamA} - {teamB}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-[#65558F]">
                                            {match.finalScore || '-'}
                                        </td>
                                    </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  )}
              </div>
          )}

      </div>
    </div>
  );
};
