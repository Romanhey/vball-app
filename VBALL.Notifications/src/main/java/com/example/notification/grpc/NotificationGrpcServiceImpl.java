package com.example.notification.grpc;

import com.example.notification.service.NotificationService;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * gRPC сервис для приема уведомлений и сохранения их в хранилище.
 */
@GrpcService
public class NotificationGrpcServiceImpl extends NotificationGrpcServiceGrpc.NotificationGrpcServiceImplBase {

    private static final Logger logger = LoggerFactory.getLogger(NotificationGrpcServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    private final NotificationService notificationService;

    public NotificationGrpcServiceImpl(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Принимает одно уведомление и сохраняет его.
     */
    @Override
    public void sendNotification(NotificationRequest request, StreamObserver<NotificationResponse> responseObserver) {
        logger.info("Received gRPC notification request: date={}, level={}, content={}", 
                request.getDate(), request.getLevel(), request.getContent());

        try {
            var stored = notificationService.createNotificationFromGrpc(
                    request.getLevel(),
                    request.getContent(),
                    parseDate(request.getDate())
            );

            NotificationResponse response = NotificationResponse.newBuilder()
                    .setSuccess(true)
                    .setMessage("Notification stored successfully")
                    .setNotificationId(String.valueOf(stored.getId()))
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
            logger.info("Notification stored successfully with ID: {}", stored.getId());
            
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
     * Принимает поток уведомлений и сохраняет их.
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
                    notificationService.createNotificationFromGrpc(
                            request.getLevel(),
                            request.getContent(),
                            parseDate(request.getDate())
                    );
                    successCount.incrementAndGet();
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

    private LocalDateTime parseDate(String date) {
        try {
            return LocalDateTime.parse(date, DATE_FORMATTER);
        } catch (Exception e) {
            logger.warn("Could not parse date '{}', using current time", date);
            return LocalDateTime.now();
        }
    }
}
