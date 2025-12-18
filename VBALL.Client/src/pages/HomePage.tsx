import React, { useState, useMemo, useEffect } from 'react';
import {
  Match,
  FilterFormat,
  FilterStage,
  DayGroup,
  Team,
  Participation,
  ParticipationStatus,
} from '../types';
import { MenuIcon, GridIcon } from '../components/Icon';
import { FilterChip } from '../components/FilterChip';
import { MatchCard } from '../components/MatchCard';

interface HomePageProps {
  matches: Match[];
  teams: Record<number, Team>;
  participations: Participation[];
  isLoading: boolean;
  onNavigate: (page: 'NOTIFICATIONS' | 'PROFILE') => void;
  onOpenMenu: () => void;
  onMatchClick: (id: number) => void;
  onApplyToMatches: (matchIds: number[]) => Promise<void>;
}

const participationStatusMeta: Record<
  ParticipationStatus,
  { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
  [ParticipationStatus.Applied]: { label: 'Ожидает рассмотрения', tone: 'neutral' },
  [ParticipationStatus.Reviewed]: { label: 'Рассматривается', tone: 'neutral' },
  [ParticipationStatus.Registered]: { label: 'В составе', tone: 'warning' },
  [ParticipationStatus.Confirmed]: { label: 'Подтверждено', tone: 'success' },
  [ParticipationStatus.Waitlisted]: { label: 'Лист ожидания', tone: 'warning' },
  [ParticipationStatus.PendingCancellation]: { label: 'Запрошена отмена', tone: 'warning' },
  [ParticipationStatus.Cancelled]: { label: 'Отменено', tone: 'danger' },
};

export const HomePage: React.FC<HomePageProps> = ({
  matches,
  teams,
  participations,
  isLoading,
  onNavigate,
  onOpenMenu,
  onMatchClick,
  onApplyToMatches,
}) => {
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<number>>(new Set());
  const [formatFilter, setFormatFilter] = useState<FilterFormat | 'All'>('All');
  const [stageFilter, setStageFilter] = useState<FilterStage | 'All'>('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'danger'>('success');

  const participationsByMatch = useMemo(() => {
    const map = new Map<number, Participation>();
    participations.forEach((item) => {
      map.set(item.matchId, item);
    });
    return map;
  }, [participations]);

  const disabledMatches = useMemo(() => new Set(participationsByMatch.keys()), [participationsByMatch]);

  useEffect(() => {
    setSelectedMatchIds((prev) => {
      const next = new Set<number>();
      prev.forEach((matchId) => {
        if (!disabledMatches.has(matchId)) {
          next.add(matchId);
        }
      });
      return next;
    });
  }, [disabledMatches]);

  const handleToggleMatch = (id: number) => {
    if (disabledMatches.has(id)) {
      return;
    }

    setSelectedMatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (formatFilter !== 'All' && m.format !== formatFilter) return false;
      if (stageFilter !== 'All' && m.stage !== stageFilter) return false;
      return true;
    });
  }, [matches, formatFilter, stageFilter]);

  const groupedMatches: DayGroup[] = useMemo(() => {
    const groups: Record<string, Match[]> = {};

    filteredMatches.forEach((match) => {
      const startTime = match.startTime instanceof Date ? match.startTime : new Date(match.startTime);
      const dateKey = startTime.toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    });

    return Object.keys(groups)
      .sort()
      .map((dateKey) => ({
        date: new Date(dateKey),
        matches: groups[dateKey].sort((a, b) => {
          const timeA = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
          const timeB = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
          return timeA.getTime() - timeB.getTime();
        }),
      }));
  }, [filteredMatches]);

  const selectedCount = selectedMatchIds.size;

  const handleApply = async () => {
    if (!selectedCount || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const matchIds: number[] = [];
      selectedMatchIds.forEach((id) => matchIds.push(id));
      await onApplyToMatches(matchIds);
      setSelectedMatchIds(new Set());
      setFeedback('Заявки отправлены! Мы сообщим, как только администратор их рассмотрит.');
      setFeedbackTone('success');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Не удалось записаться на выбранные матчи';
      setFeedback(message);
      setFeedbackTone('danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ECE6F0] flex items-center justify-center">
        <div className="text-[#1D1B20]">Загрузка расписания...</div>
      </div>
    );
  }

  return (
    <>
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#ECE6F0] z-10 shrink-0">
        <button onClick={onOpenMenu} className="p-2 -ml-2 rounded-full hover:bg-black/5">
          <MenuIcon />
        </button>
        <h1 className="text-2xl font-normal tracking-tight text-[#1D1B20]">VBall</h1>
        <button className="p-2 -mr-2 rounded-full hover:bg-black/5" onClick={() => onNavigate('NOTIFICATIONS')}>
          <GridIcon />
        </button>
      </header>

      <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-32">
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
                    <span
                      className={`text-xs font-medium uppercase mb-0.5 ${
                        isFirst ? 'text-[#65558F]' : 'text-[#49454F]'
                      }`}
                    >
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
                  {group.matches.map((match) => {
                    const participation = participationsByMatch.get(match.matchId);
                    const badgeMeta = participation
                      ? participationStatusMeta[participation.status]
                      : undefined;

                    return (
                      <MatchCard
                        key={match.matchId}
                        match={match}
                        teams={teams}
                        isSelected={selectedMatchIds.has(match.matchId)}
                        onToggle={handleToggleMatch}
                        onClick={onMatchClick}
                        disabled={disabledMatches.has(match.matchId)}
                        statusBadge={badgeMeta?.label}
                        statusTone={badgeMeta?.tone}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {groupedMatches.length === 0 && (
            <div className="text-center py-10 text-gray-500">Нет матчей, соответствующих выбранным фильтрам.</div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 bg-gradient-to-t from-[#ECE6F0] via-[#ECE6F0]/90 to-transparent pointer-events-none">
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          {feedback && (
            <div
              className={`
                w-full max-w-md text-sm text-center px-4 py-2 rounded-xl
                ${feedbackTone === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}
              `}
            >
              {feedback}
            </div>
          )}
          <button
            className={`
              w-full max-w-md bg-[#65558F] text-white 
              px-8 py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-3
              hover:bg-[#54477A] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed
            `}
            disabled={selectedCount === 0 || isSubmitting}
            onClick={handleApply}
          >
            <span className="font-medium text-[15px] tracking-wide">
              {isSubmitting ? 'Отправляем заявки...' : 'Записаться на выбранные матчи'}
            </span>
            {selectedCount > 0 && !isSubmitting && (
              <span className="flex items-center justify-center bg-[#B3261E] text-white text-xs font-bold rounded-full w-5 h-5 border-2 border-[#65558F]">
                {selectedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
