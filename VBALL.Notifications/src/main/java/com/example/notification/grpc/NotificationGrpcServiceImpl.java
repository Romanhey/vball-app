package com.example.notification.grpc;

import com.example.notification.signalr.SignalRService;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * gRPC сервис для приема уведомлений и отправки их через SignalR.
 */
@GrpcService
public class NotificationGrpcServiceImpl extends NotificationGrpcServiceGrpc.NotificationGrpcServiceImplBase {

    private static final Logger logger = LoggerFactory.getLogger(NotificationGrpcServiceImpl.class);
    
    private final SignalRService signalRService;

    public NotificationGrpcServiceImpl(SignalRService signalRService) {
        this.signalRService = signalRService;
    }

    /**
     * Принимает одно уведомление и отправляет его клиентам через SignalR.
     */
    @Override
    public void sendNotification(NotificationRequest request, StreamObserver<NotificationResponse> responseObserver) {
        logger.info("Received gRPC notification request: date={}, level={}, content={}", 
                request.getDate(), request.getLevel(), request.getContent());

        try {
            // Отправляем уведомление через SignalR
            boolean success = signalRService.sendNotificationToClients(
                    request.getDate(),
                    request.getLevel(),
                    request.getContent()
            );

            String notificationId = UUID.randomUUID().toString();
            
            NotificationResponse response = NotificationResponse.newBuilder()
                    .setSuccess(success)
                    .setMessage(success ? "Notification sent successfully" : "Failed to send notification")
                    .setNotificationId(notificationId)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
            logger.info("Notification processed successfully with ID: {}", notificationId);
            
        } catch (Exception e) {
            logger.error("Error processing notification", e);
            
            NotificationResponse response = NotificationResponse.newBuilder()
                    .setSuccess(false)
                    .setMessage("Error: " + e.getMessage())
                    .setNotificationId("")
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        }
    }

    /**
     * Принимает поток уведомлений и отправляет их клиентам через SignalR.
     * Возвращает общий результат после обработки всех уведомлений.
     */
    @Override
    public StreamObserver<NotificationRequest> sendNotifications(StreamObserver<NotificationResponse> responseObserver) {
        return new StreamObserver<NotificationRequest>() {
            private final AtomicInteger successCount = new AtomicInteger(0);
            private final AtomicInteger failCount = new AtomicInteger(0);

            @Override
            public void onNext(NotificationRequest request) {
                logger.info("Received streaming notification: date={}, level={}, content={}", 
                        request.getDate(), request.getLevel(), request.getContent());

                try {
                    boolean success = signalRService.sendNotificationToClients(
                            request.getDate(),
                            request.getLevel(),
                            request.getContent()
                    );

                    if (success) {
                        successCount.incrementAndGet();
                    } else {
                        failCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    logger.error("Error processing streaming notification", e);
                    failCount.incrementAndGet();
                }
            }

            @Override
            public void onError(Throwable t) {
                logger.error("Error in notification stream", t);
                
                NotificationResponse response = NotificationResponse.newBuilder()
                        .setSuccess(false)
                        .setMessage("Stream error: " + t.getMessage())
                        .setNotificationId("")
                        .build();

                responseObserver.onNext(response);
                responseObserver.onCompleted();
            }

            @Override
            public void onCompleted() {
                int total = successCount.get() + failCount.get();
                boolean allSuccess = failCount.get() == 0;
                
                String message = String.format("Processed %d notifications: %d success, %d failed",
                        total, successCount.get(), failCount.get());

                NotificationResponse response = NotificationResponse.newBuilder()
                        .setSuccess(allSuccess)
                        .setMessage(message)
                        .setNotificationId(UUID.randomUUID().toString())
                        .build();

                responseObserver.onNext(response);
                responseObserver.onCompleted();
                
                logger.info("Completed processing notification stream: {}", message);
            }
        };
    }
}
