import React from 'react';
import { UserIcon, BellIcon, HomeIcon, MenuIcon } from './Icon';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: 'HOME' | 'NOTIFICATIONS' | 'PROFILE') => void;
  activePage: 'HOME' | 'NOTIFICATIONS' | 'PROFILE';
  unreadCount?: number;
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate, 
  activePage,
  unreadCount = 0 
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative bg-[#F3EDF7] w-[85%] max-w-[320px] h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
        
        {/* Header inside drawer */}
        <div className="px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
               <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-black/5">
                 <MenuIcon />
               </button>
               <h1 className="text-2xl font-normal tracking-tight text-[#1D1B20]">VBall</h1>
           </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
            
            {/* Profile */}
            <button 
              onClick={() => onNavigate('PROFILE')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-full font-medium text-[15px]
                ${activePage === 'PROFILE' ? 'bg-[#E8DEF8] text-[#1D1B20]' : 'text-[#49454F] hover:bg-black/5'}
              `}
            >
              <UserIcon />
              <span>Профиль</span>
            </button>

            {/* Notifications */}
            <button 
              onClick={() => onNavigate('NOTIFICATIONS')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-full font-medium text-[15px] relative
                ${activePage === 'NOTIFICATIONS' ? 'bg-[#E8DEF8] text-[#1D1B20]' : 'text-[#49454F] hover:bg-black/5'}
              `}
            >
              <BellIcon />
              <span>Уведомления</span>
              {/* Badge */}
              {unreadCount > 0 && (
                <span className="absolute left-8 top-3 flex items-center justify-center bg-[#B3261E] text-white text-[10px] font-bold rounded-full w-4 h-4 border border-[#F3EDF7]">
                    {unreadCount}
                </span>
              )}
            </button>

            {/* Home */}
            <button 
              onClick={() => onNavigate('HOME')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-full font-medium text-[15px]
                ${activePage === 'HOME' ? 'bg-[#E8DEF8] text-[#1D1B20]' : 'text-[#49454F] hover:bg-black/5'}
              `}
            >
              <HomeIcon />
              <span>Главная</span>
            </button>

        </nav>
      </div>
    </div>
  );
};
