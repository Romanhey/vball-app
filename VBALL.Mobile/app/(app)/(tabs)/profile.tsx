import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MatchStatus, ParticipationStatus } from '../../../src/types';
import { useAppData } from '../../../src/contexts/AppDataContext';
import { useAuthStore } from '../../../src/stores/rootStore';
import { MatchCard } from '../../../src/components/MatchCard';
import { VBALL_COLORS } from '../../../src/constants/theme';
import { participationService } from '../../../src/services/participationService';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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

export default function ProfileScreen() {
  const router = useRouter();
  const authStore = useAuthStore();
  const insets = useSafeAreaInsets();
  const { profile, participations, matches, teams, loadAllData } = useAppData();
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY'>('DETAILS');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const matchById = useMemo(() => {
    const map = new Map<number, (typeof matches)[0]>();
    matches.forEach((m) => map.set(m.matchId, m));
    return map;
  }, [matches]);

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
          match.status !== MatchStatus.Cancelled &&
          participation.status !== ParticipationStatus.Cancelled
      ) as {
      participation: (typeof participations)[0];
      match: (typeof matches)[0];
    }[];
  }, [participations, matchById]);

  const historyItems = useMemo(() => {
    return participations
      .map((participation) => ({
        participation,
        match: matchById.get(participation.matchId),
      }))
      .filter(
        ({ match }) => match && match.status === MatchStatus.Finished
      ) as {
      participation: (typeof participations)[0];
      match: (typeof matches)[0];
    }[];
  }, [participations, matchById]);

  const stats = useMemo(() => {
    const total = participations.length;
    const confirmed = participations.filter(
      (p) => p.status === ParticipationStatus.Confirmed
    ).length;
    const cancelled = participations.filter(
      (p) => p.status === ParticipationStatus.Cancelled
    ).length;
    const finished = historyItems.length;
    return { total, confirmed, cancelled, finished };
  }, [participations, historyItems]);

  const handleRequestCancellation = useCallback(
    (participationId: number, matchStartTime: Date | string, participationStatus: ParticipationStatus) => {
      const startMs = new Date(matchStartTime).getTime();
      const nowMs = Date.now();
      const hoursUntilMatch = (startMs - nowMs) / (1000 * 60 * 60);

      if (hoursUntilMatch < 24) {
        Alert.alert(
          'Отмена невозможна',
          'Отменить участие нельзя менее чем за 24 часа до начала матча.',
          [{ text: 'OK' }]
        );
        return;
      }

      const isInstantCancel = participationStatus === ParticipationStatus.Applied;

      Alert.alert(
        'Отменить участие?',
        isInstantCancel
          ? 'Ваша заявка будет отменена немедленно.'
          : 'Запрос на отмену будет направлен администратору. Продолжить?',
        [
          { text: 'Назад', style: 'cancel' },
          {
            text: 'Отменить участие',
            style: 'destructive',
            onPress: async () => {
              setCancellingId(participationId);
              try {
                await participationService.requestCancellation(participationId);
                await loadAllData();
              } catch(err) {
                console.log(err)
                Alert.alert('Ошибка', 'Не удалось отправить запрос на отмену. Попробуйте позже.');
              } finally {
                setCancellingId(null);
              }
            },
          },
        ]
      );
    },
    [loadAllData]
  );

  const handleLogout = async () => {
    await authStore.logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
      >
        {/* Page title */}
        <Text style={styles.pageTitle}>Профиль</Text>

        {/* Avatar hero card */}
        {profile && (
          <View style={styles.heroCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
            </View>
            <Text style={styles.heroName}>{profile.name}</Text>
            <Text style={styles.heroEmail}>{profile.email}</Text>
            {profile.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {profile.role === 'Admin' ? 'АДМИНИСТРАТОР' : 'ИГРОК'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tab bar */}
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === 'DETAILS' && styles.tabActive]}
            onPress={() => setActiveTab('DETAILS')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'DETAILS' && styles.tabTextActive,
              ]}
            >
              Данные
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'HISTORY' && styles.tabActive]}
            onPress={() => setActiveTab('HISTORY')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'HISTORY' && styles.tabTextActive,
              ]}
            >
              История игр
            </Text>
          </Pressable>
        </View>

        {/* DETAILS tab */}
        {activeTab === 'DETAILS' && (
          <View style={styles.detailsContent}>
            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>ЗАЯВОК</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.confirmed}</Text>
                <Text style={styles.statLabel}>ПОДТВЕРЖДЕНО</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.finished}</Text>
                <Text style={styles.statLabel}>СЫГРАНО</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.cancelled}</Text>
                <Text style={styles.statLabel}>ОТМЕНЕНО</Text>
              </View>
            </View>

            {/* Personal data — email only */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>ЛИЧНЫЕ ДАННЫЕ</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {profile?.email ?? '—'}
                </Text>
              </View>
            </View>

            {/* Upcoming matches */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>ПРЕДСТОЯЩИЕ МАТЧИ</Text>
              {upcomingItems.length === 0 ? (
                <Text style={styles.emptyText}>
                  Вы пока не записаны на будущие матчи.
                </Text>
              ) : (
                <View style={styles.upcoming}>
                  {upcomingItems.map(({ participation, match }) => {
                    const startTime =
                      match.startTime instanceof Date
                        ? match.startTime
                        : new Date(match.startTime);
                    const teamA =
                      teams[match.teamAId]?.name ?? `Team ${match.teamAId}`;
                    const teamB =
                      teams[match.teamBId]?.name ?? `Team ${match.teamBId}`;
                    const dateStr = startTime.toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const canCancel =
                      participation.status !== ParticipationStatus.Cancelled &&
                      participation.status !==
                        ParticipationStatus.PendingCancellation;
                    return (
                      <View key={participation.participationId}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.upcomingRow,
                            pressed && styles.upcomingRowPressed,
                          ]}
                          onPress={() =>
                            router.push(`/(app)/match/${match.matchId}`)
                          }
                        >
                          <View style={styles.upcomingInfo}>
                            <Text
                              style={styles.upcomingTeams}
                              numberOfLines={1}
                            >
                              {teamA} — {teamB}
                            </Text>
                            <Text style={styles.upcomingDate}>{dateStr}</Text>
                          </View>
                          <View style={styles.upcomingBadge}>
                            <Text style={styles.upcomingBadgeText}>
                              {statusLabels[participation.status]}
                            </Text>
                          </View>
                        </Pressable>
                        {canCancel && (
                          <Pressable
                            style={[
                              styles.cancelBtn,
                              cancellingId === participation.participationId &&
                                styles.cancelBtnDisabled,
                            ]}
                            onPress={() =>
                              handleRequestCancellation(
                                participation.participationId,
                                match.startTime,
                                participation.status
                              )
                            }
                            disabled={
                              cancellingId === participation.participationId
                            }
                          >
                            <Text style={styles.cancelBtnText}>
                              {cancellingId === participation.participationId
                                ? 'Отправка...'
                                : 'Отменить участие'}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Logout */}
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && styles.logoutBtnPressed,
              ]}
            >
              <Text style={styles.logoutText}>Выйти из аккаунта</Text>
            </Pressable>
          </View>
        )}

        {/* HISTORY tab */}
        {activeTab === 'HISTORY' && (
          <View style={styles.history}>
            {historyItems.length === 0 ? (
              <Text style={styles.emptyTextCenter}>История игр пуста</Text>
            ) : (
              historyItems.map(({ participation, match }) => (
                <MatchCard
                  key={participation.participationId}
                  match={match}
                  teams={teams}
                  isSelected={false}
                  onToggle={() => {}}
                  onClick={(id) => router.push(`/(app)/match/${id}`)}
                  readonly
                  statusBadge={statusLabels[participation.status]}
                  statusTone="neutral"
                />
              ))
            )}
          </View>
        )}

        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VBALL_COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Page title
  pageTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: VBALL_COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Hero card
  heroCard: {
    backgroundColor: VBALL_COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: VBALL_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: VBALL_COLORS.white,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '700',
    color: VBALL_COLORS.text,
    textAlign: 'center',
  },
  heroEmail: {
    fontSize: 13,
    color: VBALL_COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: VBALL_COLORS.white,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: VBALL_COLORS.primary,
    letterSpacing: 0.8,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: VBALL_COLORS.chipActive,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: VBALL_COLORS.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: VBALL_COLORS.textMuted,
  },
  tabTextActive: {
    color: VBALL_COLORS.primary,
    fontWeight: '600',
  },

  // Details tab
  detailsContent: {
    gap: 12,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: VBALL_COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: VBALL_COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: VBALL_COLORS.textMuted,
    letterSpacing: 0.6,
    marginTop: 4,
  },

  // Section card
  sectionCard: {
    backgroundColor: VBALL_COLORS.white,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: VBALL_COLORS.primary,
    letterSpacing: 1.2,
  },

  // Personal data row
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(202,196,208,0.3)',
  },
  detailLabel: {
    fontSize: 14,
    color: VBALL_COLORS.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: VBALL_COLORS.text,
    flexShrink: 1,
    marginLeft: 12,
    textAlign: 'right',
  },

  // Upcoming match rows
  upcoming: {
    gap: 8,
  },
  upcomingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: VBALL_COLORS.cardBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  upcomingRowPressed: {
    backgroundColor: VBALL_COLORS.cardBgHover,
  },
  upcomingInfo: {
    flex: 1,
    marginRight: 10,
  },
  upcomingTeams: {
    fontSize: 13,
    fontWeight: '600',
    color: VBALL_COLORS.text,
  },
  upcomingDate: {
    fontSize: 12,
    color: VBALL_COLORS.textMuted,
    marginTop: 2,
  },
  upcomingBadge: {
    backgroundColor: VBALL_COLORS.chipActive,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upcomingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: VBALL_COLORS.primary,
  },

  // Cancel button
  cancelBtn: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${VBALL_COLORS.danger}4D`,
    alignItems: 'center',
  },
  cancelBtnDisabled: {
    opacity: 0.5,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: VBALL_COLORS.danger,
  },

  // Empty states
  emptyText: {
    fontSize: 13,
    color: VBALL_COLORS.textMuted,
  },
  emptyTextCenter: {
    textAlign: 'center',
    paddingVertical: 40,
    color: VBALL_COLORS.textMuted,
  },

  // History tab
  history: {
    gap: 8,
  },

  // Logout button
  logoutBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${VBALL_COLORS.danger}4D`,
    alignItems: 'center',
  },
  logoutBtnPressed: {
    backgroundColor: `${VBALL_COLORS.danger}1A`,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: VBALL_COLORS.danger,
  },
});
