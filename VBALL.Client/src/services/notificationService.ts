import { notificationsApiClient } from './httpClient';
import type { NotificationResponse, NotificationRequest } from '../types';

export const notificationService = {
  /**
   * Get all notifications
   */
  async getAllNotifications(): Promise<NotificationResponse[]> {
    const response = await notificationsApiClient.get<NotificationResponse[]>('/api/notifications');
    return response.data;
  },

  /**
   * Get recent notifications (from last 2 days)
   */
  async getRecentNotifications(): Promise<NotificationResponse[]> {
    const response = await notificationsApiClient.get<NotificationResponse[]>('/api/notifications/recent');
    return response.data;
  },

  /**
   * Get notification by ID
   */
  async getNotificationById(id: number): Promise<NotificationResponse> {
    const response = await notificationsApiClient.get<NotificationResponse>(`/api/notifications/${id}`);
    return response.data;
  },

  /**
   * Create notification
   */
  async createNotification(dto: NotificationRequest): Promise<NotificationResponse> {
    const response = await notificationsApiClient.post<NotificationResponse>('/api/notifications', dto);
    return response.data;
  },

  /**
   * Update notification (can be used to mark as read)
   */
  async updateNotification(id: number, dto: NotificationRequest): Promise<NotificationResponse> {
    const response = await notificationsApiClient.put<NotificationResponse>(`/api/notifications/${id}`, dto);
    return response.data;
  },

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<void> {
    await notificationsApiClient.delete(`/api/notifications/${id}`);
  },
};
