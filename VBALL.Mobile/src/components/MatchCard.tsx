import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Match, Team } from '../types';
import { CheckIcon } from './Icon';
import { VBALL_COLORS } from '../constants/theme';

interface MatchCardProps {
  match: Match;
  teams: Record<number, Team>;
  isSelected: boolean;
  onToggle: (id: number) => void;
  onClick: (id: number) => void;
  readonly?: boolean;
  disabled?: boolean;
  statusBadge?: string;
  statusTone?: 'neutral' | 'success' | 'warning' | 'danger';
}

const TONE_STYLES: Record<
  'neutral' | 'success' | 'warning' | 'danger',
  { bg: string; text: string }
> = {
  neutral: { bg: VBALL_COLORS.chipActive, text: VBALL_COLORS.primary },
  success: { bg: VBALL_COLORS.successBg, text: VBALL_COLORS.success },
  warning: { bg: VBALL_COLORS.warningBg, text: VBALL_COLORS.warning },
  danger: { bg: VBALL_COLORS.dangerBg, text: VBALL_COLORS.danger },
};

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  teams,
  isSelected,
  onToggle,
  onClick,
  readonly = false,
  disabled = false,
  statusBadge,
  statusTone = 'neutral',
}) => {
  const teamA = teams[match.teamAId];
  const teamB = teams[match.teamBId];

  const startTime =
    match.startTime instanceof Date
      ? match.startTime
      : new Date(match.startTime);
  const timeString = startTime.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const teamAName = teamA?.name || `Team ${match.teamAId}`;
  const teamBName = teamB?.name || `Team ${match.teamBId}`;
  const title = `${teamAName} - ${teamBName}`;
  const displayTitle = match.format === '4x4' ? `${title}(4x4)` : title;

  const toneStyle = TONE_STYLES[statusTone];

  return (
    <View
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardDefault,
        disabled && styles.cardDisabled,
      ]}
    >
      <Pressable
        style={styles.body}
        onPress={() => !disabled && onClick(match.matchId)}
      >
        {statusBadge && (
          <View
            style={[
              styles.badge,
              { backgroundColor: toneStyle.bg },
            ]}
          >
            <Text style={[styles.badgeText, { color: toneStyle.text }]}>
              {statusBadge}
            </Text>
          </View>
        )}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {displayTitle}
          </Text>
          {readonly && match.finalScore && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{match.finalScore}</Text>
            </View>
          )}
        </View>
        <Text style={styles.time}>{timeString}</Text>
      </Pressable>

      {!readonly && (
        <Pressable
          style={styles.toggle}
          onPress={() => {
            if (disabled) return;
            onToggle(match.matchId);
          }}
        >
          <View
            style={[
              styles.checkbox,
              isSelected ? styles.checkboxSelected : styles.checkboxDefault,
            ]}
          >
            {isSelected && <CheckIcon size={14} />}
          </View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: VBALL_COLORS.chipActive,
  },
  cardDefault: {
    backgroundColor: VBALL_COLORS.cardBg,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: VBALL_COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: VBALL_COLORS.chipActive,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  scoreText: {
    color: VBALL_COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  time: {
    color: VBALL_COLORS.text,
    fontSize: 14,
    marginTop: 4,
  },
  toggle: {
    padding: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: VBALL_COLORS.primary,
    borderColor: VBALL_COLORS.primary,
  },
  checkboxDefault: {
    borderColor: VBALL_COLORS.textMuted,
    backgroundColor: 'transparent',
  },
});
