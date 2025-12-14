import React from 'react';
import { Notification } from '../types';
import { ChevronLeftIcon } from './Icon';

interface NotificationsPageProps {
  notifications: Notification[];
  onBack: () => void;
  onConfirm?: (id: number) => void;
  onReject?: (id: number) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ 
  notifications, 
  onBack,
  onConfirm,
  onReject 
}) => {
  return (
    <div className="flex flex-col h-full bg-[#ECE6F0]">
      {/* Page Content Header */}
      <div className="px-4 py-6 flex flex-col items-center relative">
         <h2 className="text-xl font-normal text-[#1D1B20]">Уведомления</h2>
         
         {/* Custom Back Button positioned absolute right as per screenshot */}
         <button 
            onClick={onBack}
            className="absolute right-4 top-5 w-10 h-10 border border-[#1D1B20] rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors"
         >
            <ChevronLeftIcon />
         </button>
      </div>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-3 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Нет уведомлений
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id}
              className="bg-white border border-[#79747E] rounded-xl p-4 shadow-sm relative"
            >
              {/* Red dot indicator */}
              {!notif.isRead && (
                 <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#B3261E]"></div>
              )}
              
              <div className="flex justify-between items-start mb-2 pr-4">
                 <p className="text-[#1D1B20] text-sm font-bold leading-tight">
                   {notif.title}
                 </p>
              </div>

              {/* Buttons for confirmation type */}
              {notif.type === 'confirmation' && notif.actionRequired && (
                 <div className="flex gap-3 mt-3">
                    <button 
                      onClick={() => onConfirm?.(notif.id)}
                      className="flex-1 bg-[#65558F] text-white text-sm font-medium py-2 rounded-lg shadow-sm hover:bg-[#54477A]"
                    >
                      Да
                    </button>
                    <button 
                      onClick={() => onReject?.(notif.id)}
                      className="flex-1 bg-transparent border border-[#CAC4D0] text-[#1D1B20] text-sm font-medium py-2 rounded-lg hover:bg-black/5"
                    >
                      Нет
                    </button>
                 </div>
              )}

              {/* Timestamp */}
              <div className="flex justify-end mt-2">
                 <span className="text-[#49454F] text-xs">
                   {notif.dateStr}
                 </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
