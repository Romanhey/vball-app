import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Match, MatchStatus, Team, Participation, ParticipationStatus } from '../../types';
import { MenuIcon } from '../../components/Icon';
import { matchService } from '../../services/matchService';
import { participationService } from '../../services/participationService';
import { userService } from '../../services/userService';

interface AdminPageProps {
  matches: Match[];
  teams: Record<number, Team>;
  onRefresh: () => Promise<void> | void;
  onOpenMenu: () => void;
  onMatchClick: (matchId: number) => void;
  isLoading?: boolean;
}

const matchStatusOptions: { value: MatchStatus; label: string }[] = [
  { value: MatchStatus.Scheduled, label: 'Запланирован' },
  { value: MatchStatus.InProgress, label: 'В процессе' },
  { value: MatchStatus.Finished, label: 'Завершен' },
];

const matchStatusLabel = (status: MatchStatus) =>
  matchStatusOptions.find((option) => option.value === status)?.label ?? 'Неизвестно';

const participationStatusBadge: Record<ParticipationStatus, string> = {
  [ParticipationStatus.Applied]: 'secondary',
  [ParticipationStatus.Reviewed]: 'secondary',
  [ParticipationStatus.Registered]: 'warning',
  [ParticipationStatus.Confirmed]: 'success',
  [ParticipationStatus.Waitlisted]: 'warning',
  [ParticipationStatus.PendingCancellation]: 'warning',
  [ParticipationStatus.Cancelled]: 'danger',
};

export const AdminPage: React.FC<AdminPageProps> = ({
  matches,
  teams,
  onRefresh,
  onOpenMenu,
  onMatchClick,
  isLoading = false,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participation[]>([]);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});
  const [teamAssignment, setTeamAssignment] = useState<Record<number, number | null>>({});
  const [playerIdToAdd, setPlayerIdToAdd] = useState('');
  const [isParticipantsLoading, setIsParticipantsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formState, setFormState] = useState({
    startTime: '',
    teamAId: '',
    teamBId: '',
    status: MatchStatus.Scheduled,
    finalScore: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'danger'>('success');

  const selectedMatch = useMemo(
    () => matches.find((match) => match.matchId === selectedMatchId) ?? null,
    [matches, selectedMatchId]
  );

  useEffect(() => {
    if (!matches.length) {
      setSelectedMatchId(null);
      return;
    }

    if (!selectedMatchId || !matches.some((match) => match.matchId === selectedMatchId)) {
      setSelectedMatchId(matches[0].matchId);
    }
  }, [matches, selectedMatchId]);

  const fetchParticipantsForMatch = useCallback(
    async (matchId: number) => {
      setIsParticipantsLoading(true);
      try {
        const data = await participationService.getParticipations({ MatchId: matchId, take: 200 });
        setParticipants(data);
        setTeamAssignment(
          data.reduce<Record<number, number | null>>((acc, item) => {
            acc[item.participationId] = item.teamId ?? null;
            return acc;
          }, {})
        );

        const missingIds = Array.from(new Set(data.map((p) => p.playerId))).filter(
          (id) => !playerNames[id]
        );

        if (missingIds.length) {
          const users = await userService.getUsersByIds(missingIds);
          setPlayerNames((prev) => {
            const next = { ...prev };
            users.forEach((user) => {
              next[user.id] = user.name;
            });
            return next;
          });
        }
      } catch (error) {
        console.error('Failed to load participants', error);
        setMessageTone('danger');
        setMessage('Не удалось загрузить список игроков');
      } finally {
        setIsParticipantsLoading(false);
      }
    },
    [playerNames]
  );

  useEffect(() => {
    if (selectedMatchId === null) {
      setParticipants([]);
      return;
    }
    fetchParticipantsForMatch(selectedMatchId);
  }, [selectedMatchId, fetchParticipantsForMatch]);

  const openCreateForm = () => {
    setEditingMatch(null);
    setFormState({
      startTime: '',
      teamAId: '',
      teamBId: '',
      status: MatchStatus.Scheduled,
      finalScore: '',
    });
    setIsFormOpen(true);
  };

  const openEditForm = (match: Match) => {
    const start = match.startTime instanceof Date ? match.startTime : new Date(match.startTime);
    setEditingMatch(match);
    setFormState({
      startTime: formatDateForInput(start),
      teamAId: match.teamAId.toString(),
      teamBId: match.teamBId.toString(),
      status: match.status,
      finalScore: match.finalScore ?? '',
    });
    setIsFormOpen(true);
  };

  const handleMatchFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formState.startTime || !formState.teamAId || !formState.teamBId) {
      setMessageTone('danger');
      setMessage('Заполните дату и команды');
      return;
    }

    setFormSubmitting(true);
    setMessage(null);

    try {
      if (editingMatch) {
        await matchService.updateMatch(editingMatch.matchId, {
          startTime: new Date(formState.startTime).toISOString(),
          teamAId: Number(formState.teamAId),
          teamBId: Number(formState.teamBId),
          matchStatus: formState.status,
          finalScore: formState.finalScore || '',
        });
        setMessageTone('success');
        setMessage('Матч обновлен');
      } else {
        await matchService.createMatch({
          startTime: new Date(formState.startTime).toISOString(),
          teamAId: Number(formState.teamAId),
          teamBId: Number(formState.teamBId),
        });
        setMessageTone('success');
        setMessage('Матч создан');
      }

      setIsFormOpen(false);
      await Promise.resolve(onRefresh());
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Ошибка при сохранении матча';
      setMessageTone('danger');
      setMessage(errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTeamAssignmentChange = (participationId: number, value: number | null) => {
    setTeamAssignment((prev) => ({
      ...prev,
      [participationId]: value,
    }));
  };

  const handleParticipationAction = async (
    participation: Participation,
    action:
      | 'review'
      | 'waitlistReview'
      | 'approve'
      | 'confirm'
      | 'approveCancellation'
      | 'rejectCancellation'
  ) => {
    if (!selectedMatchId) {
      return;
    }

    setMessage(null);
    try {
      switch (action) {
        case 'review':
          await participationService.reviewParticipation(participation.participationId);
          break;
        case 'waitlistReview':
          await participationService.reviewWaitlistedParticipation(participation.participationId);
          break;
        case 'approve':
          await participationService.approveParticipation(participation.participationId);
          break;
        case 'confirm': {
          const teamId = teamAssignment[participation.participationId];
          if (typeof teamId !== 'number') {
            setMessageTone('danger');
            setMessage('Выберите команду для назначения игрока');
            return;
          }
          await participationService.confirmParticipation(participation.participationId, teamId);
          break;
        }
        case 'approveCancellation':
          await participationService.approveCancellation(participation.participationId);
          break;
        case 'rejectCancellation':
          await participationService.rejectCancellation(participation.participationId);
          break;
        default:
          break;
      }

      setMessageTone('success');
      setMessage('Действие выполнено');
      await fetchParticipantsForMatch(selectedMatchId);
      await Promise.resolve(onRefresh());
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Ошибка при выполнении действия';
      setMessageTone('danger');
      setMessage(errorMessage);
    }
  };

  const handleAddPlayer = async () => {
    if (!selectedMatchId || !playerIdToAdd.trim()) {
      return;
    }

    try {
      await participationService.createParticipation({
        matchId: selectedMatchId,
        playerId: Number(playerIdToAdd),
      });
      setPlayerIdToAdd('');
      setMessageTone('success');
      setMessage('Игрок добавлен');
      await fetchParticipantsForMatch(selectedMatchId);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Не удалось добавить игрока. Проверьте ID и ограничения.';
      setMessageTone('danger');
      setMessage(errorMessage);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#ECE6F0]">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#ECE6F0] z-10 shrink-0 border-b border-[#E0D7EC]">
        <button onClick={onOpenMenu} className="p-2 -ml-2 rounded-full hover:bg-black/5">
          <MenuIcon />
        </button>
        <h1 className="text-2xl font-semibold text-[#1D1B20]">Панель администратора</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
        {message && (
          <div
            className={`px-4 py-3 rounded-xl text-sm ${
              messageTone === 'success' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-white/60">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1B20]">Матчи</h2>
              <p className="text-sm text-[#49454F]">Создавайте и редактируйте расписание</p>
            </div>
            <button
              className="px-4 py-2 bg-[#65558F] text-white rounded-xl text-sm font-semibold hover:bg-[#54477A] transition"
              onClick={openCreateForm}
            >
              Создать матч
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#49454F] border-b border-[#F3EDF7]">
                  <th className="py-3 pr-4">Дата</th>
                  <th className="py-3 pr-4">Команды</th>
                  <th className="py-3 pr-4">Статус</th>
                  <th className="py-3 pr-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => {
                  const start = match.startTime instanceof Date ? match.startTime : new Date(match.startTime);
                  return (
                    <tr key={match.matchId} className="border-b border-[#F3EDF7] last:border-b-0">
                      <td className="py-3 pr-4 text-[#1D1B20]">
                        {start.toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 pr-4 text-[#1D1B20] font-medium">
                        {teams[match.teamAId]?.name ?? `Team ${match.teamAId}`} —{' '}
                        {teams[match.teamBId]?.name ?? `Team ${match.teamBId}`}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex px-2 py-1 rounded-full bg-[#E8DEF8] text-[#65558F] text-xs font-semibold">
                          {matchStatusLabel(match.status)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 space-x-2">
                        <button
                          className="text-sm text-[#65558F] font-semibold hover:underline"
                          onClick={() => openEditForm(match)}
                        >
                          Редактировать
                        </button>
                        <button
                          className="text-sm text-[#65558F] font-semibold hover:underline"
                          onClick={() => onMatchClick(match.matchId)}
                        >
                          Открыть
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {matches.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#49454F]">
                      Матчи отсутствуют. Создайте первый матч, чтобы начать.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {isFormOpen && (
            <form onSubmit={handleMatchFormSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#49454F] mb-2">
                  Дата и время
                </label>
                <input
                  type="datetime-local"
                  value={formState.startTime}
                  onChange={(e) => setFormState((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="rounded-xl border border-[#D0C7E1] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#49454F] mb-2">
                  Команда A
                </label>
                <select
                  value={formState.teamAId}
                  onChange={(e) => setFormState((prev) => ({ ...prev, teamAId: e.target.value }))}
                  className="rounded-xl border border-[#D0C7E1] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                  required
                >
                  <option value="">Выберите команду</option>
                  {Object.values(teams).map((team) => (
                    <option key={team.teamId} value={team.teamId}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#49454F] mb-2">
                  Команда B
                </label>
                <select
                  value={formState.teamBId}
                  onChange={(e) => setFormState((prev) => ({ ...prev, teamBId: e.target.value }))}
                  className="rounded-xl border border-[#D0C7E1] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                  required
                >
                  <option value="">Выберите команду</option>
                  {Object.values(teams).map((team) => (
                    <option key={team.teamId} value={team.teamId}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#49454F] mb-2">
                  Статус
                </label>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, status: Number(e.target.value) as MatchStatus }))
                  }
                  className="rounded-xl border border-[#D0C7E1] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                >
                  {matchStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {formState.status === MatchStatus.Finished && (
                <div className="flex flex-col">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#49454F] mb-2">
                    Итоговый счет
                  </label>
                  <input
                    type="text"
                    placeholder="3:1"
                    value={formState.finalScore}
                    onChange={(e) => setFormState((prev) => ({ ...prev, finalScore: e.target.value }))}
                    className="rounded-xl border border-[#D0C7E1] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                  />
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#CBC4D9] text-[#49454F] text-sm font-semibold hover:bg-[#F3EDF7]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#65558F] text-white text-sm font-semibold hover:bg-[#54477A] disabled:opacity-50"
                >
                  {formSubmitting ? 'Сохраняем...' : 'Сохранить'}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-white/60">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1B20]">Состав матча</h2>
              <p className="text-sm text-[#49454F]">
                Управляйте заявками игроков и назначайте их в команды
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedMatchId ?? ''}
                onChange={(e) => setSelectedMatchId(e.target.value ? Number(e.target.value) : null)}
                className="rounded-xl border border-[#D0C7E1] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#65558F]"
              >
                {matches.map((match) => {
                  const start = match.startTime instanceof Date ? match.startTime : new Date(match.startTime);
                  return (
                    <option key={match.matchId} value={match.matchId}>
                      {start.toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {teams[match.teamAId]?.name ?? match.teamAId} vs{' '}
                      {teams[match.teamBId]?.name ?? match.teamBId}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {selectedMatch && (
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-[#49454F]">
              <div>
                <span className="font-semibold text-[#1D1B20]">Матч:</span>{' '}
                {teams[selectedMatch.teamAId]?.name ?? `Team ${selectedMatch.teamAId}`} —{' '}
                {teams[selectedMatch.teamBId]?.name ?? `Team ${selectedMatch.teamBId}`}
              </div>
              <div>
                <span className="font-semibold text-[#1D1B20]">Статус:</span>{' '}
                {matchStatusLabel(selectedMatch.status)}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="number"
              placeholder="ID игрока"
              value={playerIdToAdd}
              onChange={(e) => setPlayerIdToAdd(e.target.value)}
              className="rounded-xl border border-[#D0C7E1] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#65558F] flex-1"
            />
            <button
              onClick={handleAddPlayer}
              className="px-4 py-2 bg-[#65558F] text-white rounded-xl text-sm font-semibold hover:bg-[#54477A] transition"
            >
              Добавить в матч
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#49454F] border-b border-[#F3EDF7]">
                  <th className="py-3 pr-4">Игрок</th>
                  <th className="py-3 pr-4">Статус</th>
                  <th className="py-3 pr-4">Команда</th>
                  <th className="py-3 pr-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => {
                  const badgeTone = participationStatusBadge[participant.status];
                  const badgeClass =
                    badgeTone === 'success'
                      ? 'bg-green-100 text-green-800'
                      : badgeTone === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : badgeTone === 'danger'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-[#E8DEF8] text-[#65558F]';

                  return (
                    <tr key={participant.participationId} className="border-b border-[#F3EDF7] last:border-b-0">
                      <td className="py-3 pr-4 text-[#1D1B20] font-medium">
                        {playerNames[participant.playerId] ?? `Игрок #${participant.playerId}`}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                          {participant.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {selectedMatch &&
                        (participant.status === ParticipationStatus.Registered ||
                          participant.status === ParticipationStatus.Confirmed) ? (
                          <div className="flex flex-col gap-2">
                            <TeamAssignmentSelector
                              match={selectedMatch}
                              teams={teams}
                              selectedTeamId={teamAssignment[participant.participationId]}
                              onSelect={(teamId) => handleTeamAssignmentChange(participant.participationId, teamId)}
                              disabled={participant.status === ParticipationStatus.Confirmed}
                            />
                            {participant.status === ParticipationStatus.Registered && (
                              <button
                                className="px-3 py-2 text-xs rounded-xl bg-[#65558F] text-white font-semibold hover:bg-[#54477A]"
                                onClick={() => handleParticipationAction(participant, 'confirm')}
                              >
                                Назначить
                              </button>
                            )}
                          </div>
                        ) : participant.teamId ? (
                          teams[participant.teamId]?.name ?? `Team ${participant.teamId}`
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 pr-4 flex flex-wrap gap-2">
                        {participant.status === ParticipationStatus.Applied && (
                          <button
                            className="text-sm text-[#65558F] font-semibold hover:underline"
                            onClick={() => handleParticipationAction(participant, 'review')}
                          >
                            Рассмотреть
                          </button>
                        )}
                        {participant.status === ParticipationStatus.Waitlisted && (
                          <button
                            className="text-sm text-[#65558F] font-semibold hover:underline"
                            onClick={() => handleParticipationAction(participant, 'waitlistReview')}
                          >
                            Вернуть в очередь
                          </button>
                        )}
                        {participant.status === ParticipationStatus.Reviewed && (
                          <button
                            className="text-sm text-[#65558F] font-semibold hover:underline"
                            onClick={() => handleParticipationAction(participant, 'approve')}
                          >
                            В основной состав
                          </button>
                        )}
                        {participant.status === ParticipationStatus.PendingCancellation && (
                          <>
                            <button
                              className="text-sm text-[#65558F] font-semibold hover:underline"
                              onClick={() => handleParticipationAction(participant, 'approveCancellation')}
                            >
                              Одобрить отмену
                            </button>
                            <button
                              className="text-sm text-[#65558F] font-semibold hover:underline"
                              onClick={() => handleParticipationAction(participant, 'rejectCancellation')}
                            >
                              Отклонить
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#49454F]">
                      {isParticipantsLoading ? 'Загружаем игроков...' : 'Заявки пока не поступали.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

const formatDateForInput = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface TeamAssignmentSelectorProps {
  match: Match;
  teams: Record<number, Team>;
  selectedTeamId: number | null | undefined;
  onSelect: (teamId: number) => void;
  disabled?: boolean;
}

const TeamAssignmentSelector: React.FC<TeamAssignmentSelectorProps> = ({
  match,
  teams,
  selectedTeamId,
  onSelect,
  disabled = false,
}) => {
  const options = [
    {
      id: match.teamAId,
      name: teams[match.teamAId]?.name ?? `Team ${match.teamAId}`,
    },
    {
      id: match.teamBId,
      name: teams[match.teamBId]?.name ?? `Team ${match.teamBId}`,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const isSelected = selectedTeamId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onSelect(option.id)}
            className={`w-full rounded-2xl border px-3 py-2 text-left transition ${
              isSelected
                ? 'border-[#65558F] bg-[#E8DEF8] text-[#1D1B20]'
                : 'border-[#D0C7E1] bg-white text-[#1D1B20]'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#65558F]/70'}`}
          >
            <span className="text-sm font-semibold">{option.name}</span>
            <span className="block text-[11px] text-[#49454F]">ID {option.id}</span>
          </button>
        );
      })}
    </div>
  );
};
