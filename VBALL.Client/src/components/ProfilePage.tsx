import React, { useMemo, useState } from 'react';
import {
  Match,
  MatchStatus,
  Team,
  PlayerProfile,
  Participation,
  ParticipationStatus,
} from '../types';
import { MenuIcon, LogOutIcon } from './Icon';
import { MatchCard } from './MatchCard';

interface ProfilePageProps {
  profile: PlayerProfile | null;
  participations: Participation[];
  matches: Match[];
  teams: Record<number, Team>;
  onOpenMenu: () => void;
  onMatchClick: (id: number) => void;
  onLogout: () => void;
}

const statusLabels: Record<ParticipationStatus, string> = {
  [ParticipationStatus.Applied]: 'Ожидает рассмотрения',
  [ParticipationStatus.Reviewed]: 'Рассматривается',
  [ParticipationStatus.Registered]: 'В составе',
  [ParticipationStatus.Confirmed]: 'Подтвержден',
  [ParticipationStatus.Waitlisted]: 'Лист ожидания',
  [ParticipationStatus.PendingCancellation]: 'Запрошена отмена',
  [ParticipationStatus.Cancelled]: 'Отменено',
};

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  participations,
  matches,
  teams,
  onOpenMenu,
  onMatchClick,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY'>('DETAILS');

  const matchById = useMemo(() => {
    const map = new Map<number, Match>();
    matches.forEach((match) => map.set(match.matchId, match));
    return map;
  }, [matches]);

  const historyItems = useMemo(() => {
    return participations
      .map((participation) => ({
        participation,
        match: matchById.get(participation.matchId),
      }))
      .filter(({ match }) => match && match.status === MatchStatus.Finished) as {
      participation: Participation;
      match: Match;
    }[];
  }, [participations, matchById]);

  const upcomingItems = useMemo(() => {
    return participations
      .map((participation) => ({
        participation,
        match: matchById.get(participation.matchId),
      }))
      .filter(
        ({ match, participation }) =>
          match &&
          match.status !== MatchStatus.Finished &&
          participation.status !== ParticipationStatus.Cancelled
      ) as { participation: Participation; match: Match }[];
  }, [participations, matchById]);

  const stats = useMemo(() => {
    const total = participations.length;
    const confirmed = participations.filter((p) => p.status === ParticipationStatus.Confirmed).length;
    const cancelled = participations.filter((p) => p.status === ParticipationStatus.Cancelled).length;
    const finished = historyItems.length;
    return { total, confirmed, cancelled, finished };
  }, [participations, historyItems]);

  if (!profile) {
    return (
      <div className="flex flex-col h-full bg-[#ECE6F0]">
        <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#ECE6F0] z-10 shrink-0">
          <button onClick={onOpenMenu} className="p-2 -ml-2 rounded-full hover:bg-black/5">
            <MenuIcon />
          </button>
          <h1 className="text-2xl font-normal tracking-tight text-[#1D1B20]">Профиль</h1>
          <div className="w-10"></div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Загружаем данные профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#ECE6F0]">
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#ECE6F0] z-10 shrink-0">
        <button onClick={onOpenMenu} className="p-2 -ml-2 rounded-full hover:bg-black/5">
          <MenuIcon />
        </button>
        <h1 className="text-2xl font-normal tracking-tight text-[#1D1B20]">Профиль</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-6">
        <div className="bg-[#F3EDF7] rounded-3xl p-6 flex flex-col items-center mb-6 shadow-sm border border-white/40">
          <div className="w-24 h-24 bg-[#65558F] rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-md">
            {profile.name
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-[#1D1B20] text-center">{profile.name}</h2>
          <p className="text-sm text-[#49454F] mt-1">{profile.email}</p>
          {profile.role && (
            <span className="text-xs mt-2 px-3 py-1 rounded-full bg-white text-[#65558F] font-semibold uppercase tracking-wide">
              {profile.role === 'Admin' ? 'Администратор' : 'Игрок'}
            </span>
          )}
        </div>

        <div className="flex p-1 bg-[#E8DEF8] rounded-xl mb-6 shrink-0">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'DETAILS' ? 'bg-white text-[#65558F] shadow-sm' : 'text-[#49454F] hover:bg-white/50'
            }`}
          >
            Данные
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'HISTORY' ? 'bg-white text-[#65558F] shadow-sm' : 'text-[#49454F] hover:bg-white/50'
            }`}
          >
            История игр
          </button>
        </div>

        {activeTab === 'DETAILS' ? (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Заявок" value={stats.total} />
              <StatCard label="Подтверждено" value={stats.confirmed} />
              <StatCard label="Сыграно" value={stats.finished} />
              <StatCard label="Отменено" value={stats.cancelled} />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm mt-2 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-[#65558F] uppercase tracking-widest mb-1">Личные данные</h3>
              <DetailRow label="Email" value={profile.email} />
              <DetailRow label="Телефон" value={profile.phone ?? '—'} />
              <DetailRow label="Возраст" value={profile.age ? `${profile.age} лет` : '—'} />
              <DetailRow label="Рост" value={profile.height ? `${profile.height} см` : '—'} />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold text-[#65558F] uppercase tracking-widest mb-1">
                Предстоящие матчи
              </h3>
              {upcomingItems.length === 0 && (
                <p className="text-sm text-[#49454F]">Вы пока не записаны на будущие матчи.</p>
              )}
              {upcomingItems.slice(0, 4).map(({ match, participation }) => {
                const startTime = match.startTime instanceof Date ? match.startTime : new Date(match.startTime);
                return (
                  <button
                    key={participation.participationId}
                    onClick={() => onMatchClick(match.matchId)}
                    className="flex justify-between items-center w-full text-left bg-[#F3EDF7] rounded-2xl px-4 py-3 hover:bg-[#EADDFF] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1D1B20]">
                        {teams[match.teamAId]?.name ?? `Team ${match.teamAId}`} —{' '}
                        {teams[match.teamBId]?.name ?? `Team ${match.teamBId}`}
                      </p>
                      <p className="text-xs text-[#49454F]">
                        {startTime.toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#65558F] bg-[#E8DEF8] px-2 py-1 rounded-full">
                      {statusLabels[participation.status]}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-[#B3261E]/30 text-[#B3261E] px-4 py-3 text-sm font-semibold hover:bg-[#B3261E]/10 transition-colors"
            >
              <LogOutIcon />
              Выйти из аккаунта
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            {historyItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">История игр пуста</div>
            ) : (
              <div className="divide-y divide-[#ECE6F0]">
                {historyItems.map(({ match }) => (
                  <MatchCard
                    key={match.matchId}
                    match={match}
                    teams={teams}
                    isSelected={false}
                    onToggle={() => undefined}
                    onClick={onMatchClick}
                    readonly
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-white rounded-2xl p-3 flex flex-col items-center shadow-sm">
    <span className="text-2xl font-bold text-[#65558F]">{value}</span>
    <span className="text-[10px] uppercase font-bold text-[#49454F] tracking-wide mt-1">{label}</span>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center border-b border-[#CAC4D0]/30 pb-2 last:border-b-0 last:pb-0">
    <span className="text-[#49454F] text-sm">{label}</span>
    <span className="text-[#1D1B20] font-medium">{value}</span>
  </div>
);
