package com.example.notification.service;

import com.example.notification.dto.NotificationRequest;
import com.example.notification.dto.NotificationResponse;
import com.example.notification.exception.NotificationNotFoundException;
import com.example.notification.model.Notification;
import com.example.notification.repository.NotificationStore;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationStore notificationStore;

    public NotificationService(NotificationStore notificationStore) {
        this.notificationStore = notificationStore;
    }

    public List<NotificationResponse> getAllNotifications() {
        return notificationStore.findAll().stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt))
                .map(this::mapToResponse)
                .toList();
    }

    public List<NotificationResponse> getNotificationsFromLastDays(long days) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
        return notificationStore.findSince(threshold).stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt))
                .map(this::mapToResponse)
                .toList();
    }

    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notificationStore.findById(id);
        if (notification == null) {
            throw new NotificationNotFoundException("Notification not found with id: " + id);
        }
        return mapToResponse(notification);
    }

    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType() != null ? request.getType() : "INFO");
        notification.setCreatedAt(LocalDateTime.now());

        return mapToResponse(notificationStore.save(notification));
    }

    public NotificationResponse updateNotification(Long id, NotificationRequest request) {
        Notification existing = notificationStore.findById(id);
        if (existing == null) {
            throw new NotificationNotFoundException("Notification not found with id: " + id);
        }

        existing.setTitle(request.getTitle());
        existing.setMessage(request.getMessage());
        if (request.getType() != null) {
            existing.setType(request.getType());
        }

        return mapToResponse(existing);
    }

    public void deleteNotification(Long id) {
        boolean removed = notificationStore.removeById(id);
        if (!removed) {
            throw new NotificationNotFoundException("Notification not found with id: " + id);
        }
    }

    public NotificationResponse createNotificationFromGrpc(String level, String content, LocalDateTime date) {
        Notification notification = new Notification();
        notification.setTitle(level != null ? level : "INFO");
        notification.setMessage(content);
        notification.setType(level != null ? level : "INFO");
        notification.setCreatedAt(date != null ? date : LocalDateTime.now());

        return mapToResponse(notificationStore.save(notification));
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
