import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Team } from '../../../src/types';
import { useAppData } from '../../../src/contexts/AppDataContext';
import { useAuthStore } from '../../../src/stores/rootStore';
import { teamService } from '../../../src/services/teamService';
import { VBALL_COLORS } from '../../../src/constants/theme';
import { getUserFriendlyError } from '../../../src/utils/errorUtils';

type MessageTone = 'success' | 'danger';

export default function AdminTeamsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authStore = useAuthStore();
  const { teams, loadAllData, loading } = useAppData();

  const [formState, setFormState] = useState({ name: '', rating: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>('success');
  const [ratingDrafts, setRatingDrafts] = useState<Record<number, string>>({});
  const [pendingTeamId, setPendingTeamId] = useState<number | null>(null);

  const sortedTeams = useMemo(() => {
    return Object.values(teams).sort(
      (a, b) => b.rating - a.rating || a.name.localeCompare(b.name)
    );
  }, [teams]);

  const showFeedback = (text: string, tone: MessageTone = 'success') => {
    setMessageTone(tone);
    setMessage(text);
    setTimeout(() => setMessage(null), 4000);
  };

  const resetForm = () => {
    setFormState({ name: '', rating: '' });
  };

  const handleCreateTeam = async () => {
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
      await loadAllData();
    } catch (error: unknown) {
      const errorMessage = getUserFriendlyError(
        error,
        'Не удалось создать команду'
      );
      showFeedback(errorMessage, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRating = async (teamId: number) => {
    const team = teams[teamId];
    const currentRating = team?.rating ?? 0;
    const ratingValue = Number(ratingDrafts[teamId] ?? currentRating);

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
      await loadAllData();
    } catch (error: unknown) {
      const errorMessage = getUserFriendlyError(
        error,
        'Не удалось обновить команду'
      );
      showFeedback(errorMessage, 'danger');
    } finally {
      setPendingTeamId(null);
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Управление командами</Text>
          <Text style={styles.headerSubtitle}>
            Создавайте и редактируйте составы
          </Text>
        </View>
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
          <Text style={styles.sectionTitle}>Новая команда</Text>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Название</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Например, VBall Stars"
              placeholderTextColor={VBALL_COLORS.textMuted}
              value={formState.name}
              onChangeText={(t) =>
                setFormState((prev) => ({ ...prev, name: t }))
              }
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Рейтинг</Text>
            <TextInput
              style={styles.formInput}
              placeholder="0.0"
              placeholderTextColor={VBALL_COLORS.textMuted}
              value={formState.rating}
              onChangeText={(t) =>
                setFormState((prev) => ({ ...prev, rating: t }))
              }
              keyboardType="decimal-pad"
            />
          </View>
          <Pressable
            style={[
              styles.createBtn,
              isSubmitting && styles.createBtnDisabled,
            ]}
            onPress={handleCreateTeam}
            disabled={isSubmitting}
          >
            <Text style={styles.createBtnText}>
              {isSubmitting ? 'Создаем...' : 'Создать команду'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Список команд</Text>
              <Text style={styles.sectionSubtitle}>
                {loading ? 'Обновляем данные...' : `${sortedTeams.length} команд`}
              </Text>
            </View>
            <Pressable onPress={() => loadAllData()} style={styles.refreshBtn}>
              <Text style={styles.refreshBtnText}>Обновить</Text>
            </Pressable>
          </View>

          {sortedTeams.length === 0 ? (
            <Text style={styles.emptyText}>
              Пока нет ни одной команды
            </Text>
          ) : (
            sortedTeams.map((team) => {
              const draftValue = ratingDrafts[team.teamId];
              const currentInputValue = draftValue ?? team.rating.toString();
              const isSaving = pendingTeamId === team.teamId;

              return (
                <View key={team.teamId} style={styles.teamCard}>
                  <View style={styles.teamCardHeader}>
                    <View>
                      <Text style={styles.teamName}>{team.name}</Text>
                      <Text style={styles.teamId}>ID {team.teamId}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeText}>
                        {team.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.teamCardActions}>
                    <TextInput
                      style={styles.ratingInput}
                      value={currentInputValue}
                      onChangeText={(t) =>
                        setRatingDrafts((prev) => ({
                          ...prev,
                          [team.teamId]: t,
                        }))
                      }
                      keyboardType="decimal-pad"
                    />
                    <Pressable
                      style={[
                        styles.saveBtn,
                        isSaving && styles.saveBtnDisabled,
                      ]}
                      onPress={() => handleSaveRating(team.teamId)}
                      disabled={isSaving}
                    >
                      <Text style={styles.saveBtnText}>
                        {isSaving ? 'Сохраняем...' : 'Сохранить'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: VBALL_COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: VBALL_COLORS.textMuted,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  message: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  messageSuccess: {
    backgroundColor: VBALL_COLORS.successBg,
  },
  messageDanger: {
    backgroundColor: VBALL_COLORS.dangerBg,
  },
  messageText: {
    fontSize: 14,
  },
  messageTextSuccess: {
    color: VBALL_COLORS.success,
  },
  messageTextDanger: {
    color: VBALL_COLORS.danger,
  },
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: VBALL_COLORS.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: VBALL_COLORS.textMuted,
    marginTop: 4,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: VBALL_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: VBALL_COLORS.text,
  },
  createBtn: {
    backgroundColor: VBALL_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    color: VBALL_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  refreshBtn: {},
  refreshBtnText: {
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
  teamCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VBALL_COLORS.chipActive,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F9F6FF',
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: VBALL_COLORS.text,
  },
  teamId: {
    fontSize: 12,
    color: VBALL_COLORS.textMuted,
    marginTop: 4,
  },
  ratingBadge: {
    backgroundColor: VBALL_COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: VBALL_COLORS.primary,
  },
  teamCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: VBALL_COLORS.text,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: VBALL_COLORS.primary,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: VBALL_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
