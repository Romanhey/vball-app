import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import type {
  Match,
  DayGroup,
  Participation,
} from '../../../src/types';
import { ParticipationStatus } from '../../../src/types';
import { useAppData } from '../../../src/contexts/AppDataContext';
import { useAuthStore } from '../../../src/stores/rootStore';
import { participationService } from '../../../src/services/participationService';
import { MatchCard } from '../../../src/components/MatchCard';
import { VBALL_COLORS } from '../../../src/constants/theme';

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

export default function HomeScreen() {
  const router = useRouter();
  const authStore = useAuthStore();
  const insets = useSafeAreaInsets();
  const {
    matches,
    teams,
    participations,
    loading,
    loadAllData,
    refreshParticipations,
  } = useAppData();

  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'danger'>('success');
  const [refreshing, setRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [filterTeamId, setFilterTeamId] = useState<number | null>(null);
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);

  const participationsByMatch = useMemo(() => {
    const map = new Map<number, Participation>();
    participations.forEach((item) => map.set(item.matchId, item));
    return map;
  }, [participations]);

  const disabledMatches = useMemo(
    () => new Set(participationsByMatch.keys()),
    [participationsByMatch]
  );

  useEffect(() => {
    setSelectedMatchIds((prev) => {
      const next = new Set<number>();
      prev.forEach((matchId) => {
        if (!disabledMatches.has(matchId)) next.add(matchId);
      });
      return next;
    });
  }, [disabledMatches]);

  const handleToggleMatch = (id: number) => {
    if (disabledMatches.has(id)) return;
    setSelectedMatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const startTime = m.startTime instanceof Date ? m.startTime : new Date(m.startTime);
      if (dateFrom && startTime < dateFrom) return false;
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (startTime > endOfDay) return false;
      }
      if (filterTeamId && m.teamAId !== filterTeamId && m.teamBId !== filterTeamId) return false;
      return true;
    });
  }, [matches, dateFrom, dateTo, filterTeamId]);

  const groupedMatches: DayGroup[] = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    filteredMatches.forEach((match) => {
      const startTime =
        match.startTime instanceof Date ? match.startTime : new Date(match.startTime);
      const dateKey = startTime.toISOString().split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
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
    if (!selectedCount || isSubmitting) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const matchIds = Array.from(selectedMatchIds);
      const availableIds = matchIds.filter(
        (matchId) => !participations.some((p) => p.matchId === matchId)
      );
      if (availableIds.length > 0 && authStore.user?.id) {
        await Promise.all(
          availableIds.map((matchId) =>
            participationService.createParticipation({
              matchId,
              playerId: Number(authStore.user!.id),
            })
          )
        );
        await refreshParticipations();
      }
      setSelectedMatchIds(new Set());
      setFeedback(
        'Заявки отправлены! Мы сообщим, как только администратор их рассмотрит.'
      );
      setFeedbackTone('success');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setFeedback(
        err?.response?.data?.message ||
          err?.message ||
          'Не удалось записаться на выбранные матчи'
      );
      setFeedbackTone('danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка расписания...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>VBall</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[VBALL_COLORS.primary]}
          />
        }
      >
        <View style={styles.filters}>
          <Text style={styles.sectionTitle}>Расписание игр</Text>

          <View style={styles.filterRow}>
            <Pressable
              style={styles.dateFilterBtn}
              onPress={() => setShowDateFromPicker(true)}
            >
              <Text style={styles.dateFilterLabel}>От</Text>
              <Text style={styles.dateFilterValue}>
                {dateFrom ? dateFrom.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) : 'Любая'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.dateFilterBtn}
              onPress={() => setShowDateToPicker(true)}
            >
              <Text style={styles.dateFilterLabel}>До</Text>
              <Text style={styles.dateFilterValue}>
                {dateTo ? dateTo.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) : 'Любая'}
              </Text>
            </Pressable>
            {(dateFrom || dateTo) && (
              <Pressable onPress={() => { setDateFrom(null); setDateTo(null); }} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.filterRow}>
            <Pressable
              style={[styles.dateFilterBtn, { flex: 1 }]}
              onPress={() => setTeamPickerOpen(true)}
            >
              <Text style={styles.dateFilterLabel}>Команда</Text>
              <Text style={styles.dateFilterValue}>
                {filterTeamId ? (teams[filterTeamId]?.name ?? `Team ${filterTeamId}`) : 'Все команды'}
              </Text>
            </Pressable>
            {filterTeamId && (
              <Pressable onPress={() => setFilterTeamId(null)} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </Pressable>
            )}
          </View>

          {showDateFromPicker && (
            <DateTimePicker
              value={dateFrom ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowDateFromPicker(false);
                if (date) setDateFrom(date);
              }}
            />
          )}
          {showDateToPicker && (
            <DateTimePicker
              value={dateTo ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowDateToPicker(false);
                if (date) setDateTo(date);
              }}
            />
          )}

          <Modal
            visible={teamPickerOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setTeamPickerOpen(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setTeamPickerOpen(false)}>
              <Pressable onPress={(e) => e.stopPropagation()} style={styles.pickerModal}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Pressable
                    style={styles.pickerOption}
                    onPress={() => { setFilterTeamId(null); setTeamPickerOpen(false); }}
                  >
                    <Text style={styles.pickerOptionText}>Все команды</Text>
                  </Pressable>
                  {Object.values(teams).map((team) => (
                    <Pressable
                      key={team.teamId}
                      style={styles.pickerOption}
                      onPress={() => { setFilterTeamId(team.teamId); setTeamPickerOpen(false); }}
                    >
                      <Text style={styles.pickerOptionText}>{team.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>
        </View>

        <View style={styles.matches}>
          {groupedMatches.map((group) => {
            const dayName = group.date.toLocaleDateString('ru-RU', {
              weekday: 'short',
            });
            const dayNumber = group.date.getDate();
            const isFirst = groupedMatches[0]?.date.getTime() === group.date.getTime();

            return (
              <View key={group.date.toISOString()} style={styles.dayGroup}>
                <View style={styles.dayLabel}>
                  <Text
                    style={[
                      styles.dayName,
                      isFirst && styles.dayNameFirst,
                    ]}
                  >
                    {dayName}
                  </Text>
                  <View
                    style={[
                      styles.dayNumber,
                      isFirst && styles.dayNumberFirst,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumberText,
                        isFirst && styles.dayNumberTextFirst,
                      ]}
                    >
                      {dayNumber}
                    </Text>
                  </View>
                </View>
                <View style={styles.dayMatches}>
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
                        onClick={(id) => router.push(`/(app)/match/${id}`)}
                        disabled={disabledMatches.has(match.matchId)}
                        statusBadge={badgeMeta?.label}
                        statusTone={badgeMeta?.tone}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}

          {groupedMatches.length === 0 && (
            <Text style={styles.emptyText}>
              Нет матчей, соответствующих выбранным фильтрам.
            </Text>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {feedback && (
          <View
            style={[
              styles.feedback,
              feedbackTone === 'success'
                ? styles.feedbackSuccess
                : styles.feedbackDanger,
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                feedbackTone === 'success'
                  ? styles.feedbackTextSuccess
                  : styles.feedbackTextDanger,
              ]}
            >
              {feedback}
            </Text>
          </View>
        )}
        <Pressable
          style={[
            styles.applyBtn,
            (selectedCount === 0 || isSubmitting) && styles.applyBtnDisabled,
          ]}
          onPress={handleApply}
          disabled={selectedCount === 0 || isSubmitting}
        >
          <Text style={styles.applyBtnText}>
            {isSubmitting
              ? 'Отправляем заявки...'
              : 'Записаться на выбранные матчи'}
          </Text>
          {selectedCount > 0 && !isSubmitting && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: VBALL_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: VBALL_COLORS.text,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: VBALL_COLORS.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: VBALL_COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  filters: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: VBALL_COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  dateFilterBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    padding: 10,
  },
  dateFilterLabel: {
    fontSize: 11,
    color: VBALL_COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateFilterValue: {
    fontSize: 14,
    color: VBALL_COLORS.text,
    marginTop: 2,
  },
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VBALL_COLORS.chipActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 14,
    color: VBALL_COLORS.textMuted,
  },
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
  pickerOptionText: {
    fontSize: 16,
    color: VBALL_COLORS.text,
  },
  matches: {
    flex: 1,
  },
  dayGroup: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabel: {
    width: '15%',
    minWidth: 50,
    alignItems: 'center',
    paddingTop: 8,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: VBALL_COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dayNameFirst: {
    color: VBALL_COLORS.primary,
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberFirst: {
    backgroundColor: VBALL_COLORS.primary,
  },
  dayNumberText: {
    fontSize: 18,
    fontWeight: '500',
    color: VBALL_COLORS.text,
  },
  dayNumberTextFirst: {
    color: VBALL_COLORS.white,
  },
  dayMatches: {
    flex: 1,
    paddingLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    color: VBALL_COLORS.textMuted,
  },
  bottomSpacer: {
    height: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: VBALL_COLORS.background,
    alignItems: 'center',
    gap: 12,
  },
  feedback: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  feedbackSuccess: {
    backgroundColor: VBALL_COLORS.successBg,
  },
  feedbackDanger: {
    backgroundColor: VBALL_COLORS.dangerBg,
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
  feedbackTextSuccess: {
    color: VBALL_COLORS.success,
  },
  feedbackTextDanger: {
    color: VBALL_COLORS.danger,
  },
  applyBtn: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: VBALL_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
    color: VBALL_COLORS.white,
    fontSize: 15,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: VBALL_COLORS.danger,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: VBALL_COLORS.primary,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: VBALL_COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
