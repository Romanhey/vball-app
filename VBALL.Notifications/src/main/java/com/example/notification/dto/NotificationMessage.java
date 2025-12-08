package com.example.notification.dto;

import java.time.LocalDateTime;

/**
 * DTO для передачи уведомлений через WebSocket
 */
public class NotificationMessage {
    
    private String id;
    private LocalDateTime date;
    private String level;
    private String content;
    private LocalDateTime sentAt;

    public NotificationMessage() {
        this.sentAt = LocalDateTime.now();
    }

    public NotificationMessage(String id, LocalDateTime date, String level, String content) {
        this.id = id;
        this.date = date;
        this.level = level;
        this.content = content;
        this.sentAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    @Override
    public String toString() {
        return "NotificationMessage{" +
                "id='" + id + '\'' +
                ", date=" + date +
                ", level='" + level + '\'' +
                ", content='" + content + '\'' +
                ", sentAt=" + sentAt +
                '}';
    }
}
