import { Ionicons } from '@expo/vector-icons';
import { VBALL_COLORS } from '../constants/theme';

export const MenuIcon = ({ size = 24 }: { size?: number }) => (
  <Ionicons name="menu" size={size} color={VBALL_COLORS.text} />
);

export const GridIcon = ({ size = 24 }: { size?: number }) => (
  <Ionicons name="grid" size={size} color={VBALL_COLORS.text} />
);

export const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <Ionicons name="checkmark" size={size} color={VBALL_COLORS.white} />
);

export const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <Ionicons name="close" size={size} color={VBALL_COLORS.text} />
);

export const ArrowLeftIcon = ({ size = 24 }: { size?: number }) => (
  <Ionicons name="arrow-back" size={size} color={VBALL_COLORS.text} />
);

export const UserIcon = ({ size = 24 }: { size?: number }) => (
  <Ionicons name="person" size={size} color={VBALL_COLORS.text} />
);

export const BellIcon = ({ size = 24 }: { size?: number }) => (
  <Ionicons name="notifications" size={size} color={VBALL_COLORS.text} />
);

export const HomeIcon = ({ size = 24 }: { size?: number }) => (
  <Ionicons name="home" size={size} color={VBALL_COLORS.text} />
);

export const ChevronLeftIcon = ({ size = 24 }: { size?: number }) => (
  <Ionicons name="chevron-back" size={size} color={VBALL_COLORS.text} />
);

export const LogOutIcon = ({ size = 18 }: { size?: number }) => (
  <Ionicons name="log-out" size={size} color={VBALL_COLORS.danger} />
);
