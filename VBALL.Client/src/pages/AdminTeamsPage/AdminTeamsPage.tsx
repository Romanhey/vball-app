import React, { useMemo, useState } from 'react';
import { MenuIcon } from '../../components/Icon';
import { Team } from '../../types';
import { teamService } from '../../services/teamService';

interface AdminTeamsPageProps {
  teams: Team[];
  onRefresh: () => Promise<void> | void;
  onOpenMenu: () => void;
  isLoading?: boolean;
}

type MessageTone = 'success' | 'danger';

export const AdminTeamsPage: React.FC<AdminTeamsPageProps> = ({
  teams,
  onRefresh,
  onOpenMenu,
  isLoading = false,
}) => {
  const [formState, setFormState] = useState({ name: '', rating: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>('success');
  const [ratingDrafts, setRatingDrafts] = useState<Record<number, string>>({});
  const [pendingTeamId, setPendingTeamId] = useState<number | null>(null);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  }, [teams]);

  const showFeedback = (text: string, tone: MessageTone = 'success') => {
    setMessageTone(tone);
    setMessage(text);
    setTimeout(() => setMessage(null), 4000);
  };

  const resetForm = () => {
    setFormState({ name: '', rating: '' });
  };

  const handleCreateTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      showFeedback('Укажите название команды', 'danger');
      return;
    }

    const ratingValue = Number(formState.rating || '0');
    if (Number.isNaN(ratingValue) || ratingValue < 0) {
      showFeedback('Рейтинг должен быть положительным числом', 'danger');
      return;
    }

    setIsSubmitting(true);
    try {
      await teamService.createTeam({
        name: formState.name.trim(),
        rating: ratingValue,
      });
      showFeedback('Команда создана');
      resetForm();
      await onRefresh();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не удалось создать команду';
      showFeedback(errorMessage, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRating = async (teamId: number) => {
    const ratingValue = Number(ratingDrafts[teamId] ?? getTeamRating(teamId));
    if (Number.isNaN(ratingValue) || ratingValue < 0) {
      showFeedback('Рейтинг должен быть положительным числом', 'danger');
      return;
    }

    setPendingTeamId(teamId);
    try {
      await teamService.updateTeam(teamId, { rating: ratingValue });
      showFeedback('Рейтинг обновлен');
      setRatingDrafts((prev) => {
        const next = { ...prev };
        delete next[teamId];
        return next;
      });
      await onRefresh();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не удалось обновить команду';
      showFeedback(errorMessage, 'danger');
    } finally {
      setPendingTeamId(null);
    }
  };

  const getTeamRating = (teamId: number) => {
    const team = teams.find((t) => t.teamId === teamId);
    return team ? team.rating : 0;
  };

  return (
    <div className="flex flex-col h-full bg-[#ECE6F0]">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#ECE6F0] z-10 shrink-0 border-b border-[#E0D7EC]">
        <button onClick={onOpenMenu} className="p-2 -ml-2 rounded-full hover:bg-black/5" aria-label="Меню">
          <MenuIcon />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#1D1B20]">Команды</h1>
          <p className="text-sm text-[#49454F]">Создавайте и редактируйте составы</p>
        </div>
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
          <h2 className="text-xl font-semibold text-[#1D1B20] mb-4">Новая команда</h2>
          <form className="flex flex-col gap-4" onSubmit={handleCreateTeam}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#49454F]">
                Название
              </label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-2xl border border-[#D0C7E1] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                placeholder="Например, VBall Stars"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#49454F]">
                Рейтинг
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formState.rating}
                onChange={(e) => setFormState((prev) => ({ ...prev, rating: e.target.value }))}
                className="rounded-2xl border border-[#D0C7E1] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                placeholder="0.0"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#65558F] text-white py-3 rounded-2xl font-semibold hover:bg-[#54477A] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Создаем...' : 'Создать команду'}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-white/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1B20]">Список команд</h2>
              <p className="text-sm text-[#49454F]">
                {isLoading ? 'Обновляем данные...' : `${sortedTeams.length} команд`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRefresh()}
              className="text-sm font-semibold text-[#65558F] hover:underline"
            >
              Обновить
            </button>
          </div>

          {sortedTeams.length === 0 ? (
            <p className="text-center text-[#49454F] py-6">Пока нет ни одной команды</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedTeams.map((team) => {
                const draftValue = ratingDrafts[team.teamId];
                const currentInputValue = draftValue ?? team.rating.toString();
                const isSaving = pendingTeamId === team.teamId;

                return (
                  <div
                    key={team.teamId}
                    className="rounded-2xl border border-[#E8DEF8] px-4 py-3 bg-[#F9F6FF] flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <p className="text-base font-semibold text-[#1D1B20]">{team.name}</p>
                        <span className="text-xs text-[#49454F]">ID {team.teamId}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#65558F] bg-white px-3 py-1 rounded-full">
                        {team.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={currentInputValue}
                        onChange={(e) =>
                          setRatingDrafts((prev) => ({
                            ...prev,
                            [team.teamId]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-2xl border border-[#D0C7E1] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#65558F]"
                      />
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveRating(team.teamId)}
                        className="px-4 py-2 rounded-2xl bg-[#65558F] text-white text-sm font-semibold hover:bg-[#54477A] disabled:opacity-50"
                      >
                        {isSaving ? 'Сохраняем...' : 'Сохранить'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};


