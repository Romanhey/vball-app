// API Configuration
export const API_CONFIG = {
  IDENTITY_API_URL: process.env.REACT_APP_IDENTITY_API_URL || 'http://192.168.1.103:5000/api',
  SCHEDULE_API_URL: process.env.REACT_APP_SCHEDULE_API_URL || 'http://192.168.1.103:5054/api',
  NOTIFICATIONS_API_URL: process.env.REACT_APP_NOTIFICATIONS_API_URL || 'http://192.168.1.103:8080',
};

// For production, these might be proxied through nginx
export const getIdentityApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api'; // Proxied through nginx
  }
  return API_CONFIG.IDENTITY_API_URL;
};

export const getScheduleApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api'; // Proxied through nginx
  }
  return API_CONFIG.SCHEDULE_API_URL;
};

export const getNotificationsApiUrl = () => {
  return API_CONFIG.NOTIFICATIONS_API_URL; // Always direct, not proxied
};
