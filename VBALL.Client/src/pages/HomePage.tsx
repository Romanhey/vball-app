import React, { useState, useMemo, useEffect } from 'react';
import { Match, FilterFormat, FilterStage, DayGroup, Team } from '../types';
import { MenuIcon, GridIcon } from '../components/Icon';
import { FilterChip } from '../components/FilterChip';
import { MatchCard } from '../components/MatchCard';
import { MatchDetails } from '../components/MatchDetails';
import { matchService } from '../services/matchService';
import { teamService } from '../services/teamService';

interface HomePageProps {
  onNavigate: (page: 'NOTIFICATIONS' | 'PROFILE') => void;
  onOpenMenu: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenMenu }) => {
  const [viewMatchId, setViewMatchId] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Record<number, Team>>({});
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<number>>(new Set());
  const [formatFilter, setFormatFilter] = useState<FilterFormat | 'All'>('All');
  const [stageFilter, setStageFilter] = useState<FilterStage | 'All'>('All');
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [matchesData, teamsData] = await Promise.all([
          matchService.getMatches({ skip: 0, take: 100 }),
          teamService.getTeams({ skip: 0, take: 100 })
        ]);

        setMatches(matchesData);
        
        const teamsRecord: Record<number, Team> = {};
        teamsData.forEach(team => {
          teamsRecord[team.teamId] = team;
        });
        setTeams(teamsRecord);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleToggleMatch = (id: number) => {
    setSelectedMatchIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMatchClick = (id: number) => {
    setViewMatchId(id);
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (formatFilter !== 'All' && m.format !== formatFilter) return false;
      if (stageFilter !== 'All' && m.stage !== stageFilter) return false;
      return true;
    });
  }, [matches, formatFilter, stageFilter]);

  const groupedMatches: DayGroup[] = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    
    filteredMatches.forEach(match => {
      const startTime = match.startTime instanceof Date 
        ? match.startTime 
        : new Date(match.startTime);
      const dateKey = startTime.toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    });

    return Object.keys(groups)
      .sort()
      .map(dateKey => ({
        date: new Date(dateKey),
        matches: groups[dateKey].sort((a, b) => {
          const timeA = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
          const timeB = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
          return timeA.getTime() - timeB.getTime();
        })
      }));
  }, [filteredMatches]);

  const selectedCount = selectedMatchIds.size;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECE6F0] flex items-center justify-center">
        <div className="text-[#1D1B20]">Загрузка...</div>
      </div>
    );
  }

  if (viewMatchId !== null) {
    const match = matches.find(m => m.matchId === viewMatchId);
    
    if (match) {
      const teamA = teams[match.teamAId] || null;
      const teamB = teams[match.teamBId] || null;
      
      return (
        <div className="min-h-screen bg-[#ECE6F0] flex justify-center font-sans">
          <div className="w-full max-w-md bg-[#ECE6F0] min-h-screen shadow-2xl relative flex flex-col">
            <MatchDetails 
              match={match} 
              teamA={teamA}
              teamB={teamB}
              onBack={() => setViewMatchId(null)} 
            />
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#ECE6F0] z-10 shrink-0">
        <button 
          onClick={onOpenMenu}
          className="p-2 -ml-2 rounded-full hover:bg-black/5"
        >
          <MenuIcon />
        </button>
        <h1 className="text-2xl font-normal tracking-tight text-[#1D1B20]">VBall</h1>
        <button className="p-2 -mr-2 rounded-full hover:bg-black/5">
          <GridIcon />
        </button>
      </header>

      <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-24">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold mb-4">Расписание игр</h2>
          
          <div className="flex gap-2 mb-3">
            <FilterChip 
              label="4×4" 
              isActive={formatFilter === '4x4'} 
              onClick={() => setFormatFilter(formatFilter === '4x4' ? 'All' : '4x4')} 
            />
            <FilterChip 
              label="Классика" 
              isActive={formatFilter === 'Classic'} 
              onClick={() => setFormatFilter(formatFilter === 'Classic' ? 'All' : 'Classic')}
              onClear={formatFilter === 'Classic' ? () => setFormatFilter('All') : undefined}
            />
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <FilterChip 
              label="Матч в группе" 
              isActive={stageFilter === 'Group'} 
              onClick={() => setStageFilter(stageFilter === 'Group' ? 'All' : 'Group')} 
            />
            <FilterChip 
              label="Финал" 
              isActive={stageFilter === 'Final'} 
              onClick={() => setStageFilter(stageFilter === 'Final' ? 'All' : 'Final')}
              onClear={stageFilter === 'Final' ? () => setStageFilter('All') : undefined} 
            />
            <FilterChip 
              label="Матч звезд" 
              isActive={stageFilter === 'StarMatch'} 
              onClick={() => setStageFilter(stageFilter === 'StarMatch' ? 'All' : 'StarMatch')} 
            />
          </div>
        </div>

        <div className="flex flex-col">
          {groupedMatches.map((group, index) => {
            const dayName = group.date.toLocaleDateString('ru-RU', { weekday: 'short' }); 
            const dayNumber = group.date.getDate();
            const isFirst = index === 0;

            return (
              <div key={group.date.toISOString()} className="flex w-full mb-1">
                <div className="w-[15%] min-w-[50px] flex flex-col items-center pt-2">
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-medium uppercase mb-0.5 ${isFirst ? 'text-[#65558F]' : 'text-[#49454F]'}`}>
                      {dayName}
                    </span>
                    <div 
                      className={`
                        w-9 h-9 flex items-center justify-center rounded-full font-medium text-lg
                        ${isFirst ? 'bg-[#65558F] text-white shadow-md' : 'bg-transparent text-[#1D1B20]'}
                      `}
                    >
                      {dayNumber}
                    </div>
                  </div>
                </div>

                <div className="flex-1 pl-2">
                  {group.matches.map(match => (
                    <MatchCard 
                      key={match.matchId}
                      match={match}
                      teams={teams}
                      isSelected={selectedMatchIds.has(match.matchId)}
                      onToggle={handleToggleMatch}
                      onClick={handleMatchClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          
          {groupedMatches.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Нет матчей, соответствующих выбранным фильтрам.
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-20">
        <button 
          className="
            pointer-events-auto
            bg-[#65558F] text-white 
            px-8 py-3.5 
            rounded-2xl 
            shadow-xl 
            flex items-center gap-3
            hover:bg-[#54477A] active:scale-95 transition-all
          "
          onClick={() => alert(`Записано на ${selectedCount} игр!`)}
        >
          <span className="font-medium text-[15px] tracking-wide">Записаться</span>
          {selectedCount > 0 && (
            <span className="flex items-center justify-center bg-[#B3261E] text-white text-xs font-bold rounded-full w-5 h-5 -mt-4 -mr-4 border-2 border-[#65558F]">
              {selectedCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};
