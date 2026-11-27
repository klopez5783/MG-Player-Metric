package com.example.demo.services;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

// Sends one email through Brevo's HTTP API (Railway blocks SMTP below the Pro
// plan). The only class that knows which provider is used. With no API key
// set, emails are logged instead of sent, so local runs work without one.
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final RestClient brevo = RestClient.builder()
            .baseUrl("https://api.brevo.com/v3")
            .build();

    private final String apiKey;
    private final String fromAddress;
    private final String fromName;

    public EmailService(
            @Value("${brevo.api-key}") String apiKey,
            @Value("${email.from-address}") String fromAddress,
            @Value("${email.from-name}") String fromName) {
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
    }

    // Throws if Brevo rejects the request; callers decide what a failure means.
    public void send(String to, String subject, String html) {
        if (to == null || to.isBlank()) {
            log.warn("Email not sent, no recipient: {}", subject);
            return;
        }
        if (apiKey.isBlank()) {
            log.info("Email not sent (no BREVO_API_KEY) to {}: {}", to, subject);
            return;
        }

        brevo.post()
                .uri("/smtp/email")
                .header("api-key", apiKey)
                .body(Map.of(
                        "sender", Map.of("name", fromName, "email", fromAddress),
                        "to", List.of(Map.of("email", to)),
                        "subject", subject,
                        "htmlContent", html))
                .retrieve()
                .toBodilessEntity();
        log.info("Email sent to {}: {}", to, subject);
    }
}
