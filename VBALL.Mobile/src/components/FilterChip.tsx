import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { VBALL_COLORS } from '../constants/theme';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  onClear?: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isActive,
  onClick,
  onClear,
}) => {
  return (
    <Pressable
      onPress={onClick}
      style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
    >
      {isActive && <Text style={styles.checkmark}>✓</Text>}
      <Text
        style={[
          styles.label,
          isActive ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {label}
      </Text>
      {isActive && onClear && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onClear();
          }}
          style={styles.clearBtn}
        >
          <Text style={styles.clearText}>×</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipActive: {
    backgroundColor: VBALL_COLORS.chipActive,
    borderWidth: 0,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
  },
  checkmark: {
    marginRight: 4,
    color: VBALL_COLORS.text,
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelActive: {
    color: VBALL_COLORS.text,
  },
  labelInactive: {
    color: VBALL_COLORS.textMuted,
  },
  clearBtn: {
    marginLeft: 8,
    padding: 2,
  },
  clearText: {
    fontSize: 14,
    color: VBALL_COLORS.text,
  },
});
