import React from 'react';
import { Menu, Grid, Check, X, ArrowLeft, User, Bell, Home, ChevronLeft } from 'lucide-react';

export const MenuIcon = () => <Menu size={24} color="#1D1B20" />;
export const GridIcon = () => <Grid size={24} color="#1D1B20" />;
export const CheckIcon = ({ className }: { className?: string }) => <Check size={16} className={className || "text-white"} />;
export const CloseIcon = ({ size = 16 }: { size?: number }) => <X size={size} color="#1D1B20" />;
export const ArrowLeftIcon = () => <ArrowLeft size={24} color="#1D1B20" />;

// New Icons
export const UserIcon = () => <User size={24} color="#1D1B20" />;
export const BellIcon = () => <Bell size={24} color="#1D1B20" />;
export const HomeIcon = () => <Home size={24} color="#1D1B20" />;
export const ChevronLeftIcon = () => <ChevronLeft size={24} color="#1D1B20" />;
