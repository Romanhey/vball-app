import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MatchStatus } from '../../../src/types';
import { matchService } from '../../../src/services/matchService';
import { teamService } from '../../../src/services/teamService';
import { ArrowLeftIcon } from '../../../src/components/Icon';
import { VBALL_COLORS } from '../../../src/constants/theme';
import type { Match, Team } from '../../../src/types';

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [match, setMatch] = useState<Match | null>(null);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const matchId = parseInt(id, 10);
      if (isNaN(matchId)) return;
      setLoading(true);
      try {
        const m = await matchService.getMatch(matchId);
        if (m) {
          setMatch(m);
          const [ta, tb] = await Promise.all([
            teamService.getTeam(m.teamAId),
            teamService.getTeam(m.teamBId),
          ]);
          setTeamA(ta);
          setTeamB(tb);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const getStatusText = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.Scheduled:
        return 'Запланирована';
      case MatchStatus.InProgress:
        return 'Идет сейчас';
      case MatchStatus.Finished:
        return 'Завершена';
      case MatchStatus.Cancelled:
        return 'Отменена';
      default:
        return '';
    }
  };

  const getStageText = (stage?: string) => {
    switch (stage) {
      case 'Group':
        return 'Групповой этап';
      case 'Final':
        return 'Финал';
      case 'StarMatch':
        return 'Матч звезд';
      default:
        return 'Матч';
    }
  };

  if (loading || !match) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={VBALL_COLORS.primary} />
      </View>
    );
  }

  const startTime =
    match.startTime instanceof Date ? match.startTime : new Date(match.startTime);
  const dateStr = startTime.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeStr = startTime.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const teamAName = teamA?.name || `Team ${match.teamAId}`;
  const teamBName = teamB?.name || `Team ${match.teamBId}`;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeftIcon />
        </Pressable>
        <Text style={styles.headerTitle}>Игра</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.formatRow}>
          {match.format && (
            <View style={styles.formatBadge}>
              <Text style={styles.formatText}>
                {match.format === '4x4' ? '4×4' : 'Классика'}
              </Text>
            </View>
          )}
          <Text style={styles.stageText}>•</Text>
          <Text style={styles.stageText}>{getStageText(match.stage)}</Text>
        </View>

        <View style={styles.teamsRow}>
          <View style={styles.teamCol}>
            <View style={styles.teamAvatar}>
              <Text style={styles.teamAvatarText}>{teamAName[0]}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={2}>
              {teamAName}
            </Text>
          </View>
          <View style={styles.scoreCol}>
            <Text style={styles.score}>
              {match.finalScore || 'VS'}
            </Text>
          </View>
          <View style={styles.teamCol}>
            <View style={styles.teamAvatar}>
              <Text style={styles.teamAvatarText}>{teamBName[0]}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={2}>
              {teamBName}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            match.status === MatchStatus.Finished && styles.statusFinished,
            match.status === MatchStatus.InProgress && styles.statusInProgress,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              match.status === MatchStatus.InProgress && styles.statusTextWhite,
            ]}
          >
            {getStatusText(match.status)}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Информация</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoCaption}>Дата начала</Text>
          <Text style={styles.infoValue}>{dateStr}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoCaption}>Время</Text>
          <Text style={styles.infoValue}>{timeStr}</Text>
        </View>
        {match.finalScore && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoCaption}>Итоговый счет</Text>
              <Text style={styles.infoValue}>{match.finalScore}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: VBALL_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: VBALL_COLORS.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: VBALL_COLORS.text,
  },
  card: {
    backgroundColor: VBALL_COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  formatBadge: {
    backgroundColor: VBALL_COLORS.chipActive,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formatText: {
    color: VBALL_COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  stageText: {
    color: VBALL_COLORS.textMuted,
    fontSize: 14,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  teamCol: {
    width: '40%',
    alignItems: 'center',
  },
  teamAvatar: {
    width: 64,
    height: 64,
    backgroundColor: VBALL_COLORS.chipActive,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  teamAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: VBALL_COLORS.primary,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: VBALL_COLORS.text,
    textAlign: 'center',
  },
  scoreCol: {
    width: '20%',
    alignItems: 'center',
    paddingTop: 12,
  },
  score: {
    fontSize: 24,
    fontWeight: '800',
    color: VBALL_COLORS.text,
    letterSpacing: 2,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: VBALL_COLORS.primary,
  },
  statusFinished: {
    backgroundColor: VBALL_COLORS.chipActive,
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
  },
  statusInProgress: {
    backgroundColor: VBALL_COLORS.danger,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: VBALL_COLORS.text,
    textTransform: 'uppercase',
  },
  statusTextWhite: {
    color: VBALL_COLORS.white,
  },
  infoCard: {
    backgroundColor: VBALL_COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: VBALL_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 4,
  },
  infoCaption: {
    fontSize: 14,
    color: VBALL_COLORS.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '500',
    color: VBALL_COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: `${VBALL_COLORS.border}80`,
    marginVertical: 16,
  },
});
