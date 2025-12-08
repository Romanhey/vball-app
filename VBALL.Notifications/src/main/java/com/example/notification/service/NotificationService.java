package com.example.notification.service;

import com.example.notification.dto.NotificationRequest;
import com.example.notification.dto.NotificationResponse;
import com.example.notification.exception.NotificationNotFoundException;
import com.example.notification.model.Notification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class NotificationService {

    private final Map<Long, Notification> notifications = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public List<NotificationResponse> getAllNotifications() {
        return notifications.values().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notifications.get(id);
        if (notification == null) {
            throw new NotificationNotFoundException("Notification not found with id: " + id);
        }
        return mapToResponse(notification);
    }

    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setId(idGenerator.getAndIncrement());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType() != null ? request.getType() : "INFO");
        notification.setCreatedAt(LocalDateTime.now());

        notifications.put(notification.getId(), notification);
        return mapToResponse(notification);
    }

    public NotificationResponse updateNotification(Long id, NotificationRequest request) {
        Notification existing = notifications.get(id);
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
        if (!notifications.containsKey(id)) {
            throw new NotificationNotFoundException("Notification not found with id: " + id);
        }
        notifications.remove(id);
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
