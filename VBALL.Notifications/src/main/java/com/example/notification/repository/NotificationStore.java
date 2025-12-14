package com.example.notification.repository;

import com.example.notification.model.Notification;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Deque;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Потокобезопасное in-memory хранилище уведомлений.
 * Хранит порядок добавления и умеет выдавать срез за период.
 */
@Component
public class NotificationStore {

    private final Deque<Notification> notifications = new ConcurrentLinkedDeque<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            notification.setId(idGenerator.getAndIncrement());
        }
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        notifications.add(notification);
        return notification;
    }

    public List<Notification> findAll() {
        return List.copyOf(notifications);
    }

    public Notification findById(Long id) {
        return notifications.stream()
                .filter(n -> n.getId() != null && n.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public boolean removeById(Long id) {
        return notifications.removeIf(n -> n.getId() != null && n.getId().equals(id));
    }

    public List<Notification> findSince(LocalDateTime threshold) {
        return notifications.stream()
                .filter(n -> n.getCreatedAt() != null && !n.getCreatedAt().isBefore(threshold))
                .toList();
    }
}

