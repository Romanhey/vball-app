import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Match, Team, Participation } from '../../../src/types';
import { MatchStatus, ParticipationStatus } from '../../../src/types';
import { useAppData } from '../../../src/contexts/AppDataContext';
import { useAuthStore } from '../../../src/stores/rootStore';
import { matchService } from '../../../src/services/matchService';
import { participationService } from '../../../src/services/participationService';
import { userService } from '../../../src/services/userService';
import { VBALL_COLORS } from '../../../src/constants/theme';
import { getUserFriendlyError } from '../../../src/utils/errorUtils';

const matchStatusOptions: { value: MatchStatus; label: string }[] = [
  { value: MatchStatus.Scheduled, label: 'Запланирован' },
  { value: MatchStatus.InProgress, label: 'В процессе' },
  { value: MatchStatus.Finished, label: 'Завершен' },
];

const matchStatusLabel = (status: MatchStatus) =>
  matchStatusOptions.find((o) => o.value === status)?.label ?? 'Неизвестно';

const participationStatusBadge: Record<
  ParticipationStatus,
  'success' | 'warning' | 'danger' | 'neutral'
> = {
  [ParticipationStatus.Applied]: 'neutral',
  [ParticipationStatus.Reviewed]: 'neutral',
  [ParticipationStatus.Registered]: 'warning',
  [ParticipationStatus.Confirmed]: 'success',
  [ParticipationStatus.Waitlisted]: 'warning',
  [ParticipationStatus.PendingCancellation]: 'warning',
  [ParticipationStatus.Cancelled]: 'danger',
};

function TeamAssignmentSelector({
  match,
  teams,
  selectedTeamId,
  onSelect,
  disabled,
}: {
  match: Match;
  teams: Record<number, Team>;
  selectedTeamId: number | null | undefined;
  onSelect: (teamId: number) => void;
  disabled?: boolean;
}) {
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
    <View style={styles.teamSelector}>
      {options.map((option) => {
        const isSelected = selectedTeamId === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => !disabled && onSelect(option.id)}
            style={[
              styles.teamOption,
              isSelected && styles.teamOptionSelected,
              disabled && styles.teamOptionDisabled,
            ]}
          >
            <Text
              style={[
                styles.teamOptionName,
                isSelected && styles.teamOptionNameSelected,
              ]}
            >
              {option.name}
            </Text>
            <Text style={styles.teamOptionId}>ID {option.id}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AdminTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authStore = useAuthStore();
  const { matches, teams, loadAllData, loading } = useAppData();
  const teamValues = useMemo(() => Object.values(teams), [teams]);

  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participation[]>([]);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});
  const [teamAssignment, setTeamAssignment] = useState<
    Record<number, number | null>
  >({});
  const [playerIdToAdd, setPlayerIdToAdd] = useState('');
  const [isParticipantsLoading, setIsParticipantsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formState, setFormState] = useState({
    startTime: new Date(),
    teamAId: '',
    teamBId: '',
    status: MatchStatus.Scheduled,
    finalScore: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'danger'>(
    'success'
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [matchPickerOpen, setMatchPickerOpen] = useState(false);
  const [teamAPickerOpen, setTeamAPickerOpen] = useState(false);
  const [teamBPickerOpen, setTeamBPickerOpen] = useState(false);

  const selectedMatch = useMemo(
    () => matches.find((m) => m.matchId === selectedMatchId) ?? null,
    [matches, selectedMatchId]
  );

  const sortedMatches = useMemo(() => [...matches].sort((a, b) => {
    const ta = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
    const tb = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
    return ta.getTime() - tb.getTime();
  }), [matches]);

  useEffect(() => {
    if (!matches.length) {
      setSelectedMatchId(null);
      return;
    }
    if (
      !selectedMatchId ||
      !matches.some((m) => m.matchId === selectedMatchId)
    ) {
      const now = new Date();
      const sorted = [...matches].sort((a, b) => {
        const ta = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
        const tb = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
        return ta.getTime() - tb.getTime();
      });
      const nearest = sorted.find((m) => {
        const t = m.startTime instanceof Date ? m.startTime : new Date(m.startTime);
        return t >= now;
      }) ?? sorted[0];
      if (nearest) setSelectedMatchId(nearest.matchId);
    }
  }, [matches, selectedMatchId]);

  const fetchParticipantsForMatch = useCallback(
    async (matchId: number) => {
      setIsParticipantsLoading(true);
      try {
        const data = await participationService.getParticipations({
          MatchId: matchId,
          take: 200,
        });
        setParticipants(data);
        setTeamAssignment(
          data.reduce<Record<number, number | null>>((acc, item) => {
            acc[item.participationId] = item.teamId ?? null;
            return acc;
          }, {})
        );

        const missingIds = Array.from(
          new Set(data.map((p) => p.playerId))
        ).filter((id) => !playerNames[id]);

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
      startTime: new Date(),
      teamAId: '',
      teamBId: '',
      status: MatchStatus.Scheduled,
      finalScore: '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (match: Match) => {
    const start =
      match.startTime instanceof Date
        ? match.startTime
        : new Date(match.startTime);
    setEditingMatch(match);
    setFormState({
      startTime: start,
      teamAId: match.teamAId.toString(),
      teamBId: match.teamBId.toString(),
      status: match.status,
      finalScore: match.finalScore ?? '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleMatchFormSubmit = async () => {
    if (!formState.teamAId || !formState.teamBId) {
      setFormError('Заполните дату и команды');
      return;
    }

    setFormSubmitting(true);
    setMessage(null);

    try {
      if (editingMatch) {
        await matchService.updateMatch(editingMatch.matchId, {
          startTime: formState.startTime.toISOString(),
          teamAId: Number(formState.teamAId),
          teamBId: Number(formState.teamBId),
          matchStatus: formState.status,
          finalScore: formState.finalScore || undefined,
        });
        setMessageTone('success');
        setMessage('Матч обновлен');
      } else {
        await matchService.createMatch({
          startTime: formState.startTime.toISOString(),
          teamAId: Number(formState.teamAId),
          teamBId: Number(formState.teamBId),
        });
        setMessageTone('success');
        setMessage('Матч создан');
      }

      setIsFormOpen(false);
      await loadAllData();
    } catch (error: unknown) {
      const errorMessage = getUserFriendlyError(
        error,
        'Ошибка при сохранении матча'
      );
      setFormError(errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTeamAssignmentChange = (
    participationId: number,
    value: number | null
  ) => {
    setTeamAssignment((prev) => ({ ...prev, [participationId]: value }));
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
    if (!selectedMatchId) return;

    setMessage(null);
    try {
      switch (action) {
        case 'review':
          await participationService.reviewParticipation(
            participation.participationId
          );
          break;
        case 'waitlistReview':
          await participationService.reviewWaitlistedParticipation(
            participation.participationId
          );
          break;
        case 'approve':
          await participationService.approveParticipation(
            participation.participationId
          );
          break;
        case 'confirm': {
          const teamId = teamAssignment[participation.participationId];
          if (typeof teamId !== 'number') {
            setMessageTone('danger');
            setMessage('Выберите команду для назначения игрока');
            return;
          }
          await participationService.confirmParticipation(
            participation.participationId,
            teamId
          );
          break;
        }
        case 'approveCancellation':
          await participationService.approveCancellation(
            participation.participationId
          );
          break;
        case 'rejectCancellation':
          await participationService.rejectCancellation(
            participation.participationId
          );
          break;
        default:
          break;
      }

      setMessageTone('success');
      setMessage('Действие выполнено');
      await fetchParticipantsForMatch(selectedMatchId);
      await loadAllData();
    } catch (error: unknown) {
      const errorMessage = getUserFriendlyError(
        error,
        'Ошибка при выполнении действия'
      );
      setMessageTone('danger');
      setMessage(errorMessage);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleAddPlayer = async () => {
    if (!selectedMatchId || !playerIdToAdd.trim()) return;

    try {
      await participationService.createParticipation({
        matchId: selectedMatchId,
        playerId: Number(playerIdToAdd),
      });
      setPlayerIdToAdd('');
      setMessageTone('success');
      setMessage('Игрок добавлен');
      await fetchParticipantsForMatch(selectedMatchId);
    } catch (error: unknown) {
      const errorMessage = getUserFriendlyError(
        error,
        'Не удалось добавить игрока. Проверьте ID и ограничения.'
      );
      setMessageTone('danger');
      setMessage(errorMessage);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (!authStore.isAdmin) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const getBadgeStyle = (tone: string) => {
    switch (tone) {
      case 'success':
        return styles.badgeSuccess;
      case 'warning':
        return styles.badgeWarning;
      case 'danger':
        return styles.badgeDanger;
      default:
        return styles.badgeNeutral;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={VBALL_COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Панель администратора</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {message && (
          <View
            style={[
              styles.message,
              messageTone === 'success'
                ? styles.messageSuccess
                : styles.messageDanger,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                messageTone === 'success'
                  ? styles.messageTextSuccess
                  : styles.messageTextDanger,
              ]}
            >
              {message}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Матчи</Text>
              <Text style={styles.sectionSubtitle}>
                Создавайте и редактируйте расписание
              </Text>
            </View>
            <Pressable style={styles.createBtn} onPress={openCreateForm}>
              <Text style={styles.createBtnText}>Создать матч</Text>
            </Pressable>
          </View>

          {sortedMatches.map((match) => {
            const start =
              match.startTime instanceof Date
                ? match.startTime
                : new Date(match.startTime);
            return (
              <View key={match.matchId} style={styles.matchRow}>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchDate}>
                    {start.toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.matchTeams}>
                    {teams[match.teamAId]?.name ?? `Team ${match.teamAId}`} —{' '}
                    {teams[match.teamBId]?.name ?? `Team ${match.teamBId}`}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {matchStatusLabel(match.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.matchActions}>
                  <Pressable
                    onPress={() => openEditForm(match)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>Редактировать</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push(`/(app)/match/${match.matchId}`)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>Открыть</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {matches.length === 0 && (
            <Text style={styles.emptyText}>
              Матчи отсутствуют. Создайте первый матч, чтобы начать.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Состав матча</Text>
              <Text style={styles.sectionSubtitle}>
                Управляйте заявками игроков и назначайте их в команды
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.pickerBtn}
            onPress={() => setMatchPickerOpen(true)}
          >
            <Text style={styles.pickerBtnText}>
              {selectedMatch
                ? (() => {
                    const start =
                      selectedMatch.startTime instanceof Date
                        ? selectedMatch.startTime
                        : new Date(selectedMatch.startTime);
                    return `${start.toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} · ${teams[selectedMatch.teamAId]?.name ?? selectedMatch.teamAId} vs ${teams[selectedMatch.teamBId]?.name ?? selectedMatch.teamBId}`;
                  })()
                : 'Выберите матч'}
            </Text>
          </Pressable>

          <Modal
            visible={matchPickerOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setMatchPickerOpen(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setMatchPickerOpen(false)}
            >
              <Pressable onPress={(e) => e.stopPropagation()} style={styles.pickerModal}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {sortedMatches.map((match) => {
                    const start =
                      match.startTime instanceof Date
                        ? match.startTime
                        : new Date(match.startTime);
                    return (
                      <Pressable
                        key={match.matchId}
                        onPress={() => {
                          setSelectedMatchId(match.matchId);
                          setMatchPickerOpen(false);
                        }}
                        style={styles.pickerOption}
                      >
                        <Text style={styles.pickerOptionText}>
                          {start.toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          · {teams[match.teamAId]?.name ?? match.teamAId} vs{' '}
                          {teams[match.teamBId]?.name ?? match.teamBId}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>

          {selectedMatch && (
            <View style={styles.selectedMatchInfo}>
              <Text style={styles.selectedMatchText}>
                <Text style={styles.selectedMatchLabel}>Матч:</Text>{' '}
                {teams[selectedMatch.teamAId]?.name ?? `Team ${selectedMatch.teamAId}`} —{' '}
                {teams[selectedMatch.teamBId]?.name ?? `Team ${selectedMatch.teamBId}`}
              </Text>
              <Text style={styles.selectedMatchText}>
                <Text style={styles.selectedMatchLabel}>Статус:</Text>{' '}
                {matchStatusLabel(selectedMatch.status)}
              </Text>
            </View>
          )}

          <View style={styles.addPlayerRow}>
            <TextInput
              style={styles.playerIdInput}
              placeholder="ID игрока"
              placeholderTextColor={VBALL_COLORS.placeholder}
              value={playerIdToAdd}
              onChangeText={setPlayerIdToAdd}
              keyboardType="number-pad"
            />
            <Pressable style={styles.addPlayerBtn} onPress={handleAddPlayer}>
              <Text style={styles.addPlayerBtnText}>Добавить в матч</Text>
            </Pressable>
          </View>

          {participants.length === 0 ? (
            <Text style={styles.emptyText}>
              {isParticipantsLoading
                ? 'Загружаем игроков...'
                : 'Заявки пока не поступали.'}
            </Text>
          ) : (
            participants.map((participant) => {
              const badgeTone = participationStatusBadge[participant.status];
              return (
                <View
                  key={participant.participationId}
                  style={styles.participantCard}
                >
                  <View style={styles.participantRow}>
                    <Text style={styles.participantName}>
                      {playerNames[participant.playerId] ??
                        `Игрок #${participant.playerId}`}
                    </Text>
                    <View
                      style={[
                        styles.participantBadge,
                        getBadgeStyle(badgeTone),
                      ]}
                    >
                      <Text style={styles.participantBadgeText}>
                        {participant.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.participantTeam}>
                    {selectedMatch &&
                    (participant.status ===
                      ParticipationStatus.Registered ||
                      participant.status ===
                        ParticipationStatus.Confirmed) ? (
                      <>
                        <TeamAssignmentSelector
                          match={selectedMatch}
                          teams={teams}
                          selectedTeamId={
                            teamAssignment[participant.participationId]
                          }
                          onSelect={(teamId) =>
                            handleTeamAssignmentChange(
                              participant.participationId,
                              teamId
                            )
                          }
                          disabled={
                            participant.status ===
                            ParticipationStatus.Confirmed
                          }
                        />
                        {participant.status ===
                          ParticipationStatus.Registered && (
                          <Pressable
                            style={styles.confirmTeamBtn}
                            onPress={() =>
                              handleParticipationAction(
                                participant,
                                'confirm'
                              )
                            }
                          >
                            <Text style={styles.confirmTeamBtnText}>
                              Назначить
                            </Text>
                          </Pressable>
                        )}
                      </>
                    ) : participant.teamId ? (
                      <Text style={styles.teamNameText}>
                        {teams[participant.teamId]?.name ??
                          `Team ${participant.teamId}`}
                      </Text>
                    ) : (
                      <Text style={styles.teamNameText}>—</Text>
                    )}
                  </View>
                  <View style={styles.participantActions}>
                    {participant.status === ParticipationStatus.Applied && (
                      <Pressable
                        onPress={() =>
                          handleParticipationAction(participant, 'review')
                        }
                        style={styles.participantActionBtn}
                      >
                        <Text style={styles.participantActionText}>
                          Рассмотреть
                        </Text>
                      </Pressable>
                    )}
                    {participant.status === ParticipationStatus.Waitlisted && (
                      <Pressable
                        onPress={() =>
                          handleParticipationAction(
                            participant,
                            'waitlistReview'
                          )
                        }
                        style={styles.participantActionBtn}
                      >
                        <Text style={styles.participantActionText}>
                          Вернуть в очередь
                        </Text>
                      </Pressable>
                    )}
                    {participant.status === ParticipationStatus.Reviewed && (
                      <Pressable
                        onPress={() =>
                          handleParticipationAction(participant, 'approve')
                        }
                        style={styles.participantActionBtn}
                      >
                        <Text style={styles.participantActionText}>
                          В основной состав
                        </Text>
                      </Pressable>
                    )}
                    {participant.status ===
                      ParticipationStatus.PendingCancellation && (
                      <>
                        <Pressable
                          onPress={() =>
                            handleParticipationAction(
                              participant,
                              'approveCancellation'
                            )
                          }
                          style={styles.participantActionBtn}
                        >
                          <Text style={styles.participantActionText}>
                            Одобрить отмену
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            handleParticipationAction(
                              participant,
                              'rejectCancellation'
                            )
                          }
                          style={styles.participantActionBtn}
                        >
                          <Text style={styles.participantActionText}>
                            Отклонить
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>

      <Modal
        visible={isFormOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFormOpen(false)}
      >
        <Pressable style={styles.formModalOverlay} onPress={() => setIsFormOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.formModal, { paddingBottom: insets.bottom + 24 }]}>
            <Text style={styles.formTitle}>
              {editingMatch ? 'Редактировать матч' : 'Создать матч'}
            </Text>

            <Pressable
              style={styles.formField}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.formLabel}>Дата и время</Text>
              <Text style={styles.formValue}>
                {formState.startTime.toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={formState.startTime}
                mode={Platform.OS === 'android' ? 'date' : 'datetime'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  if (date) {
                    setFormState((prev) => ({ ...prev, startTime: date }));
                  }
                  if (Platform.OS === 'android') {
                    setTimeout(() => setShowDatePicker(false), 100);
                  } else {
                    setShowDatePicker(false);
                  }
                }}
              />
            )}

            <Pressable
              style={styles.formField}
              onPress={() => setTeamAPickerOpen(true)}
            >
              <Text style={styles.formLabel}>Команда A</Text>
              <Text style={styles.formValue}>
                {formState.teamAId
                  ? teams[Number(formState.teamAId)]?.name ??
                    `Team ${formState.teamAId}`
                  : 'Выберите команду'}
              </Text>
            </Pressable>

            <Modal
              visible={teamAPickerOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setTeamAPickerOpen(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setTeamAPickerOpen(false)}
              >
                <Pressable onPress={(e) => e.stopPropagation()} style={styles.pickerModal}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {teamValues.map((team) => (
                      <Pressable
                        key={team.teamId}
                        onPress={() => {
                          setFormState((prev) => ({
                            ...prev,
                            teamAId: team.teamId.toString(),
                          }));
                          setTeamAPickerOpen(false);
                        }}
                        style={styles.pickerOption}
                      >
                        <Text style={styles.pickerOptionText}>{team.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </Pressable>
              </Pressable>
            </Modal>

            <Pressable
              style={styles.formField}
              onPress={() => setTeamBPickerOpen(true)}
            >
              <Text style={styles.formLabel}>Команда B</Text>
              <Text style={styles.formValue}>
                {formState.teamBId
                  ? teams[Number(formState.teamBId)]?.name ??
                    `Team ${formState.teamBId}`
                  : 'Выберите команду'}
              </Text>
            </Pressable>

            <Modal
              visible={teamBPickerOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setTeamBPickerOpen(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setTeamBPickerOpen(false)}
              >
                <Pressable onPress={(e) => e.stopPropagation()} style={styles.pickerModal}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {teamValues.map((team) => (
                      <Pressable
                        key={team.teamId}
                        onPress={() => {
                          setFormState((prev) => ({
                            ...prev,
                            teamBId: team.teamId.toString(),
                          }));
                          setTeamBPickerOpen(false);
                        }}
                        style={styles.pickerOption}
                      >
                        <Text style={styles.pickerOptionText}>{team.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </Pressable>
              </Pressable>
            </Modal>

            {editingMatch && (
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Статус</Text>
                <View style={styles.statusPicker}>
                  {matchStatusOptions.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() =>
                        setFormState((prev) => ({
                          ...prev,
                          status: opt.value,
                        }))
                      }
                      style={[
                        styles.statusOption,
                        formState.status === opt.value &&
                          styles.statusOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          formState.status === opt.value &&
                            styles.statusOptionTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {editingMatch && formState.status === MatchStatus.Finished && (
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Итоговый счет</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="3:1"
                  placeholderTextColor={VBALL_COLORS.placeholder}
                  value={formState.finalScore}
                  onChangeText={(t) =>
                    setFormState((prev) => ({ ...prev, finalScore: t }))
                  }
                />
              </View>
            )}

            {formError && (
              <View style={[styles.message, styles.messageDanger]}>
                <Text style={[styles.messageText, styles.messageTextDanger]}>{formError}</Text>
              </View>
            )}

            <View style={styles.formActions}>
              <Pressable
                style={styles.formCancelBtn}
                onPress={() => setIsFormOpen(false)}
              >
                <Text style={styles.formCancelText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.formSubmitBtn,
                  formSubmitting && styles.formSubmitBtnDisabled,
                ]}
                onPress={handleMatchFormSubmit}
                disabled={formSubmitting}
              >
                <Text style={styles.formSubmitText}>
                  {formSubmitting ? 'Сохраняем...' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: VBALL_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: VBALL_COLORS.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: VBALL_COLORS.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: VBALL_COLORS.text,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  message: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  messageSuccess: { backgroundColor: VBALL_COLORS.successBg },
  messageDanger: { backgroundColor: VBALL_COLORS.dangerBg },
  messageText: { fontSize: 14 },
  messageTextSuccess: { color: VBALL_COLORS.success },
  messageTextDanger: { color: VBALL_COLORS.danger },
  section: {
    backgroundColor: VBALL_COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${VBALL_COLORS.white}99`,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: VBALL_COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: VBALL_COLORS.textMuted,
    marginTop: 4,
  },
  createBtn: {
    backgroundColor: VBALL_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createBtnText: {
    color: VBALL_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${VBALL_COLORS.border}30`,
  },
  matchInfo: { flex: 1 },
  matchDate: {
    fontSize: 14,
    color: VBALL_COLORS.text,
    marginBottom: 4,
  },
  matchTeams: {
    fontSize: 14,
    fontWeight: '500',
    color: VBALL_COLORS.text,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: VBALL_COLORS.chipActive,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: VBALL_COLORS.primary,
  },
  matchActions: { flexDirection: 'row', gap: 12 },
  actionBtn: {},
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: VBALL_COLORS.primary,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
    color: VBALL_COLORS.textMuted,
    fontSize: 14,
  },
  pickerBtn: {
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  pickerBtnText: { fontSize: 14, color: VBALL_COLORS.text },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerModal: {
    backgroundColor: VBALL_COLORS.white,
    borderRadius: 16,
    padding: 8,
    maxHeight: 300,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${VBALL_COLORS.border}30`,
  },
  pickerOptionText: { fontSize: 16, color: VBALL_COLORS.text },
  selectedMatchInfo: { marginBottom: 12, gap: 4 },
  selectedMatchText: { fontSize: 14, color: VBALL_COLORS.textMuted },
  selectedMatchLabel: { fontWeight: '600', color: VBALL_COLORS.text },
  addPlayerRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  playerIdInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: VBALL_COLORS.text,
  },
  addPlayerBtn: {
    backgroundColor: VBALL_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addPlayerBtnText: {
    color: VBALL_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  participantCard: {
    backgroundColor: VBALL_COLORS.cardBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: `${VBALL_COLORS.border}30`,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: VBALL_COLORS.text,
  },
  participantBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeNeutral: { backgroundColor: VBALL_COLORS.chipActive },
  badgeSuccess: { backgroundColor: VBALL_COLORS.successBg },
  badgeWarning: { backgroundColor: VBALL_COLORS.warningBg },
  badgeDanger: { backgroundColor: VBALL_COLORS.dangerBg },
  participantBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: VBALL_COLORS.text,
  },
  participantTeam: { marginBottom: 8 },
  teamNameText: { fontSize: 14, color: VBALL_COLORS.textMuted },
  teamSelector: { gap: 8, marginBottom: 8 },
  teamOption: {
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: VBALL_COLORS.white,
  },
  teamOptionSelected: {
    borderColor: VBALL_COLORS.primary,
    backgroundColor: VBALL_COLORS.chipActive,
  },
  teamOptionDisabled: { opacity: 0.6 },
  teamOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: VBALL_COLORS.text,
  },
  teamOptionNameSelected: { color: VBALL_COLORS.primary },
  teamOptionId: {
    fontSize: 11,
    color: VBALL_COLORS.textMuted,
    marginTop: 4,
  },
  confirmTeamBtn: {
    alignSelf: 'flex-start',
    backgroundColor: VBALL_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  confirmTeamBtnText: {
    color: VBALL_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  participantActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantActionBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  participantActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: VBALL_COLORS.primary,
  },
  formModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  formModal: {
    backgroundColor: VBALL_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 24,
    maxHeight: '90%',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: VBALL_COLORS.text,
    marginBottom: 20,
  },
  formField: { marginBottom: 16 },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: VBALL_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  formValue: {
    fontSize: 16,
    color: VBALL_COLORS.text,
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    padding: 12,
  },
  formInput: {
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: VBALL_COLORS.text,
  },
  statusPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
  },
  statusOptionSelected: {
    borderColor: VBALL_COLORS.primary,
    backgroundColor: VBALL_COLORS.chipActive,
  },
  statusOptionText: { fontSize: 14, color: VBALL_COLORS.text },
  statusOptionTextSelected: {
    color: VBALL_COLORS.primary,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  formCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
  },
  formCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: VBALL_COLORS.textMuted,
  },
  formSubmitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: VBALL_COLORS.primary,
  },
  formSubmitBtnDisabled: { opacity: 0.5 },
  formSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: VBALL_COLORS.white,
  },
});
