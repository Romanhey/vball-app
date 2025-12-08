package com.example.notification.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefix для сообщений от сервера к клиентам
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix для сообщений от клиентов к серверу
        config.setApplicationDestinationPrefixes("/app");
        // Prefix для отправки сообщений конкретному пользователю
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint для подключения клиентов (аналог SignalR hub)
        registry.addEndpoint("/notification-hub")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // Endpoint без SockJS для чистого WebSocket
        registry.addEndpoint("/notification-hub")
                .setAllowedOriginPatterns("*");
    }
}
