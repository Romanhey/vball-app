import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type {
  Match,
  FilterFormat,
  FilterStage,
  DayGroup,
  Participation,
} from '../../../src/types';
import { ParticipationStatus } from '../../../src/types';
import { useAppData } from '../../../src/contexts/AppDataContext';
import { useAuthStore } from '../../../src/stores/rootStore';
import { participationService } from '../../../src/services/participationService';
import { MenuIcon } from '../../../src/components/Icon';
import { FilterChip } from '../../../src/components/FilterChip';
import { MatchCard } from '../../../src/components/MatchCard';
import { SideMenu } from '../../../src/components/SideMenu';
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

type MenuPage = 'HOME' | 'NOTIFICATIONS' | 'PROFILE';

export default function HomeScreen() {
  const router = useRouter();
  const authStore = useAuthStore();
  const insets = useSafeAreaInsets();
  const {
    matches,
    teams,
    notifications,
    participations,
    loading,
    loadAllData,
    refreshParticipations,
  } = useAppData();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<MenuPage>('HOME');
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<number>>(new Set());
  const [formatFilter, setFormatFilter] = useState<FilterFormat | 'All'>('All');
  const [stageFilter, setStageFilter] = useState<FilterStage | 'All'>('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'danger'>('success');
  const [refreshing, setRefreshing] = useState(false);

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
      if (formatFilter !== 'All' && m.format !== formatFilter) return false;
      if (stageFilter !== 'All' && m.stage !== stageFilter) return false;
      return true;
    });
  }, [matches, formatFilter, stageFilter]);

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

  const handleNavigate = (page: MenuPage) => {
    setIsMenuOpen(false);
    if (page === 'NOTIFICATIONS') router.push('/(app)/(tabs)/notifications');
    else if (page === 'PROFILE') router.push('/(app)/(tabs)/profile');
    else setActivePage('HOME');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
        <Pressable onPress={() => setIsMenuOpen(true)} style={styles.headerBtn}>
          <MenuIcon />
        </Pressable>
        <Text style={styles.headerTitle}>VBall</Text>
        <Pressable
          onPress={() => handleNavigate('NOTIFICATIONS')}
          style={styles.headerBtn}
        >
          <Text style={styles.headerIcon}>🔔</Text>
        </Pressable>
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
            <FilterChip
              label="4×4"
              isActive={formatFilter === '4x4'}
              onClick={() =>
                setFormatFilter(formatFilter === '4x4' ? 'All' : '4x4')
              }
            />
            <FilterChip
              label="Классика"
              isActive={formatFilter === 'Classic'}
              onClick={() =>
                setFormatFilter(formatFilter === 'Classic' ? 'All' : 'Classic')
              }
              onClear={
                formatFilter === 'Classic'
                  ? () => setFormatFilter('All')
                  : undefined
              }
            />
          </View>
          <View style={styles.filterRow}>
            <FilterChip
              label="Матч в группе"
              isActive={stageFilter === 'Group'}
              onClick={() =>
                setStageFilter(stageFilter === 'Group' ? 'All' : 'Group')
              }
            />
            <FilterChip
              label="Финал"
              isActive={stageFilter === 'Final'}
              onClick={() =>
                setStageFilter(stageFilter === 'Final' ? 'All' : 'Final')
              }
              onClear={
                stageFilter === 'Final' ? () => setStageFilter('All') : undefined
              }
            />
            <FilterChip
              label="Матч звезд"
              isActive={stageFilter === 'StarMatch'}
              onClick={() =>
                setStageFilter(
                  stageFilter === 'StarMatch' ? 'All' : 'StarMatch'
                )
              }
            />
          </View>
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

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
        activePage={activePage}
        unreadCount={unreadCount}
        showAdminLink={authStore.isAdmin}
        onLogout={async () => {
          await authStore.logout();
          router.replace('/(auth)/login');
        }}
      />
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
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: VBALL_COLORS.text,
  },
  headerIcon: {
    fontSize: 20,
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
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
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
  },
  badgeText: {
    color: VBALL_COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
