package com.example.notification.controller;

import com.example.notification.dto.NotificationRequest;
import com.example.notification.service.NotificationService;
import com.example.notification.repository.NotificationStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(NotificationController.class)
@Import(NotificationControllerTest.TestConfig.class)
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationService notificationService;

    @Test
    void getAllNotifications_returns_list() throws Exception {
        notificationService.createNotification(new NotificationRequest("t", "m", "INFO"));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/notifications"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(1));
    }

    @Test
    void createNotification_returns_created() throws Exception {
        var request = new NotificationRequest("hello", "world", null);

        mockMvc.perform(MockMvcRequestBuilders.post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").isNumber());
    }

    @Test
    void updateNotification_returns_updated() throws Exception {
        var request = new NotificationRequest("up", "msg", "WARN");
        var created = notificationService.createNotification(new NotificationRequest("orig", "msg", "INFO"));

        mockMvc.perform(MockMvcRequestBuilders.put("/api/notifications/" + created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.type").value("WARN"));
    }

    @Test
    void deleteNotification_returns_no_content() throws Exception {
        var created = notificationService.createNotification(new NotificationRequest("del", "m", null));

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/notifications/" + created.getId()))
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    static class TestConfig {
        @Bean
        @Primary
        NotificationStore notificationStore() {
            return new NotificationStore();
        }

        @Bean
        @Primary
        NotificationService notificationService(NotificationStore store) {
            return new NotificationService(store);
        }
    }
}
