package com.example.notification.controller;

import com.example.notification.dto.NotificationMessage;
import com.example.notification.signalr.SignalRService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

/**
 * WebSocket контроллер для обработки сообщений от клиентов.
 * Эквивалент SignalR Hub методов.
 */
@Controller
public class NotificationWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationWebSocketController.class);
    
    private final SignalRService signalRService;

    public NotificationWebSocketController(SignalRService signalRService) {
        this.signalRService = signalRService;
    }

    /**
     * Обработка входящих уведомлений от клиентов.
     * Клиент отправляет на /app/send-notification
     * Сообщение транслируется всем подписчикам /topic/notifications
     */
    @MessageMapping("/send-notification")
    @SendTo("/topic/notifications")
    public NotificationMessage handleNotification(NotificationMessage message) {
        logger.info("Received notification via WebSocket: {}", message);
        return message;
    }

    /**
     * Эхо-метод для тестирования соединения.
     * Клиент отправляет на /app/ping
     * Ответ отправляется на /topic/pong
     */
    @MessageMapping("/ping")
    @SendTo("/topic/pong")
    public String ping(String message) {
        logger.info("Received ping: {}", message);
        return "pong: " + message;
    }
}
