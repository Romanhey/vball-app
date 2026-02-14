import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MatchStatus, ParticipationStatus } from '../../../src/types';
import { useAppData } from '../../../src/contexts/AppDataContext';
import { useAuthStore } from '../../../src/stores/rootStore';
import { MatchCard } from '../../../src/components/MatchCard';
import { VBALL_COLORS } from '../../../src/constants/theme';

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
  const { profile, participations, matches, teams } = useAppData();
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY'>('DETAILS');

  const matchById = useMemo(() => {
    const map = new Map<number, (typeof matches)[0]>();
    matches.forEach((m) => map.set(m.matchId, m));
    return map;
  }, [matches]);

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

  const handleLogout = async () => {
    await authStore.logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Профиль</Text>
      </View>

      <View style={styles.tabs}>
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
            Детали
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
            История
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'DETAILS' && profile && (
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Имя</Text>
              <Text style={styles.detailValue}>{profile.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{profile.email}</Text>
            </View>
            {profile.role && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Роль</Text>
                <Text style={styles.detailValue}>
                  {profile.role === 'Admin' ? 'Администратор' : 'Игрок'}
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'HISTORY' && (
          <View style={styles.history}>
            {historyItems.length === 0 ? (
              <Text style={styles.emptyText}>
                Нет завершённых матчей в истории
              </Text>
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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Выйти</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VBALL_COLORS.background,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: VBALL_COLORS.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: VBALL_COLORS.cardBg,
  },
  tabActive: {
    backgroundColor: VBALL_COLORS.chipActive,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: VBALL_COLORS.textMuted,
  },
  tabTextActive: {
    color: VBALL_COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  detailsCard: {
    backgroundColor: VBALL_COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: VBALL_COLORS.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: VBALL_COLORS.text,
  },
  history: {
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    color: VBALL_COLORS.textMuted,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: VBALL_COLORS.background,
  },
  logoutBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${VBALL_COLORS.danger}4D`,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: VBALL_COLORS.danger,
  },
});
