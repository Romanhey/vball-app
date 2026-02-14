import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppData } from '../../../src/contexts/AppDataContext';
import { ChevronLeftIcon } from '../../../src/components/Icon';
import { VBALL_COLORS } from '../../../src/constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notifications } = useAppData();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Уведомления</Text>
        <Pressable
          onPress={() => router.replace('/(app)/(tabs)')}
          style={[styles.backBtn, { top: insets.top + 20 }]}
        >
          <ChevronLeftIcon />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>Нет уведомлений</Text>
        ) : (
          notifications.map((notif) => (
            <View key={notif.id} style={styles.card}>
              {!notif.isRead && <View style={styles.unreadDot} />}
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {notif.title}
                </Text>
              </View>
              {notif.text && (
                <Text style={styles.cardText} numberOfLines={3}>
                  {notif.text}
                </Text>
              )}
              <Text style={styles.cardDate}>{notif.dateStr}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VBALL_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: VBALL_COLORS.text,
  },
  backBtn: {
    position: 'absolute',
    right: 16,
    top: 20,
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: VBALL_COLORS.text,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    color: VBALL_COLORS.textMuted,
  },
  card: {
    backgroundColor: VBALL_COLORS.white,
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: VBALL_COLORS.danger,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: VBALL_COLORS.text,
  },
  cardText: {
    fontSize: 14,
    color: VBALL_COLORS.textMuted,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: VBALL_COLORS.textMuted,
  },
});
