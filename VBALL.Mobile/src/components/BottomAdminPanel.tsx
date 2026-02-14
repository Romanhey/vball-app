import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VBALL_COLORS } from '../constants/theme';

const { height } = Dimensions.get('window');
const PANEL_HEIGHT = Math.min(height * 0.35, 220);

interface BottomAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMatches: () => void;
  onNavigateToTeams: () => void;
}

export const BottomAdminPanel: React.FC<BottomAdminPanelProps> = ({
  isOpen,
  onClose,
  onNavigateToMatches,
  onNavigateToTeams,
}) => {
  const insets = useSafeAreaInsets();

  if (!isOpen) return null;

  const handleMatches = () => {
    onClose();
    onNavigateToMatches();
  };

  const handleTeams = () => {
    onClose();
    onNavigateToTeams();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.panel,
            {
              paddingBottom: insets.bottom + 24,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Администрирование</Text>

          <Pressable
            style={styles.option}
            onPress={handleMatches}
          >
            <Ionicons name="calendar" size={24} color={VBALL_COLORS.primary} />
            <Text style={styles.optionText}>Матчи</Text>
            <Ionicons name="chevron-forward" size={20} color={VBALL_COLORS.textMuted} />
          </Pressable>

          <Pressable
            style={styles.option}
            onPress={handleTeams}
          >
            <Ionicons name="people" size={24} color={VBALL_COLORS.primary} />
            <Text style={styles.optionText}>Команды</Text>
            <Ionicons name="chevron-forward" size={20} color={VBALL_COLORS.textMuted} />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: VBALL_COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    minHeight: PANEL_HEIGHT,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: VBALL_COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: VBALL_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: VBALL_COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${VBALL_COLORS.border}30`,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: VBALL_COLORS.text,
    marginLeft: 16,
  },
});
