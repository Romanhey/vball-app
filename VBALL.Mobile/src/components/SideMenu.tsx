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
import {
  UserIcon,
  BellIcon,
  HomeIcon,
  MenuIcon,
  LogOutIcon,
} from './Icon';
import { VBALL_COLORS } from '../constants/theme';

type MenuPage =
  | 'HOME'
  | 'NOTIFICATIONS'
  | 'PROFILE'
  | 'ADMIN'
  | 'ADMIN_TEAMS';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: MenuPage) => void;
  activePage: MenuPage;
  unreadCount?: number;
  showAdminLink?: boolean;
  onLogout: () => void;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.85, 320);

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  activePage,
  unreadCount = 0,
  showAdminLink = false,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  if (!isOpen) return null;

  const navItem = (
    page: MenuPage,
    label: string,
    Icon: React.ComponentType<{ size?: number }>,
    badge?: number
  ) => (
    <Pressable
      key={page}
      onPress={() => onNavigate(page)}
      style={[
        styles.navItem,
        activePage === page && styles.navItemActive,
      ]}
    >
      <Icon size={24} />
      <Text
        style={[
          styles.navLabel,
          activePage === page && styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.drawer}>
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MenuIcon size={24} />
            </Pressable>
            <Text style={styles.title}>VBall</Text>
          </View>

          <View style={styles.nav}>
            {navItem('PROFILE', 'Профиль', UserIcon)}
            {navItem('NOTIFICATIONS', 'Уведомления', BellIcon, unreadCount)}
            {navItem('HOME', 'Главная', HomeIcon)}
          </View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
            <Pressable onPress={onLogout} style={styles.logoutBtn}>
              <LogOutIcon size={18} />
              <Text style={styles.logoutText}>Выйти</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: VBALL_COLORS.cardBg,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  closeBtn: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: VBALL_COLORS.text,
    marginLeft: 16,
  },
  nav: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginBottom: 4,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: VBALL_COLORS.chipActive,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: VBALL_COLORS.textMuted,
    marginLeft: 12,
  },
  navLabelActive: {
    color: VBALL_COLORS.text,
  },
  badge: {
    position: 'absolute',
    left: 44,
    top: 12,
    backgroundColor: VBALL_COLORS.danger,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: VBALL_COLORS.cardBg,
  },
  badgeText: {
    color: VBALL_COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${VBALL_COLORS.danger}4D`,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: VBALL_COLORS.danger,
  },
});
