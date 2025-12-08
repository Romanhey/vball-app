package com.example.notification.signalr;

import com.example.notification.dto.NotificationMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Сервис для отправки уведомлений клиентам через WebSocket (аналог SignalR).
 * Использует STOMP протокол поверх WebSocket.
 */
@Service
public class SignalRService {

    private static final Logger logger = LoggerFactory.getLogger(SignalRService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final SimpMessagingTemplate messagingTemplate;

    public SignalRService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Отправляет уведомление всем подключенным клиентам через WebSocket.
     */
    public boolean sendNotificationToClients(String date, String level, String content) {
        try {
            String notificationId = UUID.randomUUID().toString();
            LocalDateTime parsedDate = parseDate(date);
            
            NotificationMessage message = new NotificationMessage(notificationId, parsedDate, level, content);
            
            logger.info("=== WebSocket Broadcast ===");
            logger.info("Sending notification to all clients:");
            logger.info("  ID: {}", notificationId);
            logger.info("  Date: {}", date);
            logger.info("  Level: {}", level);
            logger.info("  Content: {}", content);
            
            messagingTemplate.convertAndSend("/topic/notifications", message);
            
            logger.info("Notification sent successfully to /topic/notifications");
            logger.info("===========================");
            
            return true;
        } catch (Exception e) {
            logger.error("Failed to send notification via WebSocket", e);
            return false;
        }
    }

    /**
     * Отправляет уведомление конкретному пользователю через WebSocket.
     */
    public boolean sendNotificationToUser(String userId, String date, String level, String content) {
        try {
            String notificationId = UUID.randomUUID().toString();
            LocalDateTime parsedDate = parseDate(date);
            
            NotificationMessage message = new NotificationMessage(notificationId, parsedDate, level, content);
            
            logger.info("=== WebSocket User Message ===");
            logger.info("Sending notification to user: {}", userId);
            
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", message);
            
            logger.info("Notification sent successfully to user {}", userId);
            logger.info("==============================");
            
            return true;
        } catch (Exception e) {
            logger.error("Failed to send notification to user {} via WebSocket", userId, e);
            return false;
        }
    }

    /**
     * Отправляет уведомление группе пользователей через WebSocket.
     */
    public boolean sendNotificationToGroup(String groupId, String date, String level, String content) {
        try {
            String notificationId = UUID.randomUUID().toString();
            LocalDateTime parsedDate = parseDate(date);
            
            NotificationMessage message = new NotificationMessage(notificationId, parsedDate, level, content);
            
            logger.info("=== WebSocket Group Message ===");
            logger.info("Sending notification to group: {}", groupId);
            
            messagingTemplate.convertAndSend("/topic/groups/" + groupId, message);
            
            logger.info("Notification sent successfully to group {}", groupId);
            logger.info("===============================");
            
            return true;
        } catch (Exception e) {
            logger.error("Failed to send notification to group {} via WebSocket", groupId, e);
            return false;
        }
    }

    /**
     * Отправляет готовый объект NotificationMessage всем клиентам.
     */
    public boolean broadcastNotification(NotificationMessage message) {
        try {
            logger.info("Broadcasting notification: {}", message);
            messagingTemplate.convertAndSend("/topic/notifications", message);
            return true;
        } catch (Exception e) {
            logger.error("Failed to broadcast notification", e);
            return false;
        }
    }

    private LocalDateTime parseDate(String date) {
        try {
            return LocalDateTime.parse(date, DATE_FORMATTER);
        } catch (Exception e) {
            logger.warn("Could not parse date '{}', using current time", date);
            return LocalDateTime.now();
        }
    }
}
