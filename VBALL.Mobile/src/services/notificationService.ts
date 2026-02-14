import { notificationsApiClient } from './httpClient';
import type {
  NotificationResponse,
  NotificationRequest,
} from '../types';

export const notificationService = {
  async getAllNotifications(): Promise<NotificationResponse[]> {
    const response = await notificationsApiClient.get<NotificationResponse[]>(
      '/api/notifications'
    );
    return response.data;
  },

  async getRecentNotifications(): Promise<NotificationResponse[]> {
    const response = await notificationsApiClient.get<NotificationResponse[]>(
      '/api/notifications/recent'
    );
    return response.data;
  },

  async getNotificationById(id: number): Promise<NotificationResponse> {
    const response = await notificationsApiClient.get<NotificationResponse>(
      `/api/notifications/${id}`
    );
    return response.data;
  },

  async createNotification(
    dto: NotificationRequest
  ): Promise<NotificationResponse> {
    const response = await notificationsApiClient.post<NotificationResponse>(
      '/api/notifications',
      dto
    );
    return response.data;
  },

  async updateNotification(
    id: number,
    dto: NotificationRequest
  ): Promise<NotificationResponse> {
    const response = await notificationsApiClient.put<NotificationResponse>(
      `/api/notifications/${id}`,
      dto
    );
    return response.data;
  },

  async deleteNotification(id: number): Promise<void> {
    await notificationsApiClient.delete(`/api/notifications/${id}`);
  },
};
