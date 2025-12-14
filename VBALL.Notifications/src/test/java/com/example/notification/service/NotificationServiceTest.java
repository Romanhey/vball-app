package com.example.notification.service;

import com.example.notification.dto.NotificationRequest;
import com.example.notification.exception.NotificationNotFoundException;
import com.example.notification.model.Notification;
import com.example.notification.repository.NotificationStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NotificationServiceTest {

    private NotificationStore notificationStore;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationStore = new NotificationStore();
        notificationService = new NotificationService(notificationStore);
    }

    @Test
    void getAllNotifications_sorts_by_createdAt() {
        var now = LocalDateTime.now();
        var early = notification(1L, "early", now.minusDays(1));
        var late = notification(2L, "late", now);
        notificationStore.save(late);
        notificationStore.save(early);

        var result = notificationService.getAllNotifications();

        assertThat(result).extracting("id").containsExactly(1L, 2L);
    }

    @Test
    void getNotificationsFromLastDays_filters_by_threshold() {
        var now = LocalDateTime.now();
        var within = notification(1L, "keep", now.minusDays(1));
        var old = notification(2L, "old", now.minusDays(5));
        notificationStore.save(within);
        notificationStore.save(old);

        var result = notificationService.getNotificationsFromLastDays(2);

        assertThat(result).hasSize(1).first().extracting("title").isEqualTo("keep");
    }

    @Test
    void getNotificationById_throws_when_missing() {
        assertThatThrownBy(() -> notificationService.getNotificationById(5L))
                .isInstanceOf(NotificationNotFoundException.class);
    }

    @Test
    void createNotification_sets_defaults_and_persists() {
        var response = notificationService.createNotification(new NotificationRequest("Title", "Message", null));

        assertThat(response.getId()).isNotNull();
        assertThat(response.getType()).isEqualTo("INFO");
    }

    @Test
    void updateNotification_applies_changes() {
        var existing = notification(3L, "Old", LocalDateTime.now());
        existing.setType("WARN");
        notificationStore.save(existing);

        var updated = notificationService.updateNotification(3L, new NotificationRequest("NewTitle", "NewMsg", "ERROR"));

        assertThat(updated.getTitle()).isEqualTo("NewTitle");
        assertThat(updated.getMessage()).isEqualTo("NewMsg");
        assertThat(updated.getType()).isEqualTo("ERROR");
    }

    @Test
    void deleteNotification_throws_when_not_found() {
        assertThatThrownBy(() -> notificationService.deleteNotification(7L))
                .isInstanceOf(NotificationNotFoundException.class);
    }

    @Test
    void createNotificationFromGrpc_uses_defaults() {
        var response = notificationService.createNotificationFromGrpc(null, "payload", null);

        assertThat(response.getType()).isEqualTo("INFO");
        assertThat(response.getMessage()).isEqualTo("payload");
    }

    private Notification notification(Long id, String title, LocalDateTime createdAt) {
        var n = new Notification();
        n.setId(id);
        n.setTitle(title);
        n.setMessage("msg");
        n.setType("INFO");
        n.setCreatedAt(createdAt);
        return n;
    }
}

