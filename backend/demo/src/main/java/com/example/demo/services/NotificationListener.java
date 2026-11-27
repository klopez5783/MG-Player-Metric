package com.example.demo.services;

import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.HtmlUtils;

import com.example.demo.events.DrillAssignedEvent;
import com.example.demo.events.DrillReviewedEvent;
import com.example.demo.events.DrillSubmittedEvent;
import com.example.demo.events.EvaluationCreatedEvent;

// Turns the controllers' events into emails. Each handler runs only after the
// save commits (nothing is sent for a rolled-back request) and on a background
// thread (the response doesn't wait for Brevo). A failed email is logged and
// never undoes the save.
@Component
public class NotificationListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);
    private static final DateTimeFormatter DUE_DATE = DateTimeFormatter.ofPattern("MMMM d, yyyy");

    private final EmailService emailService;
    private final String appUrl;

    public NotificationListener(EmailService emailService, @Value("${app.url}") String appUrl) {
        this.emailService = emailService;
        this.appUrl = appUrl;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEvaluationCreated(EvaluationCreatedEvent event) {
        String player = playerName(event.playerName());
        send(event.toEmail(),
                "New evaluation for " + player,
                escape(coachName(event.coachName())) + " has completed a new evaluation for "
                        + escape(player) + ".",
                "/home", "View the evaluation");
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDrillAssigned(DrillAssignedEvent event) {
        String player = playerName(event.playerName());
        String due = event.dueDate() == null ? "" : " It's due " + event.dueDate().format(DUE_DATE) + ".";
        send(event.toEmail(),
                "New drill for " + player + ": " + event.drillName(),
                escape(coachName(event.coachName())) + " assigned <strong>" + escape(event.drillName())
                        + "</strong> to " + escape(player) + "." + due,
                "/player/drills", "View the drill");
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDrillSubmitted(DrillSubmittedEvent event) {
        String player = playerName(event.playerName());
        send(event.toEmail(),
                player + " submitted " + event.drillName(),
                escape(player) + " submitted a video for <strong>"
                        + escape(event.drillName()) + "</strong>. It's ready for your review.",
                "/coach/reviews", "Review it");
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDrillReviewed(DrillReviewedEvent event) {
        String player = playerName(event.playerName());
        String coach = coachName(event.coachName());
        String comment = event.comment() == null || event.comment().isBlank()
                ? ""
                : "</p><p><em>“" + escape(event.comment()) + "”</em>";
        send(event.toEmail(),
                coach + " reviewed " + player + "'s " + event.drillName(),
                escape(coach) + " reviewed " + escape(player) + "'s video for <strong>"
                        + escape(event.drillName()) + "</strong>." + comment,
                "/player/drills", "See the feedback");
    }

    // Wraps a message (already escaped) in a short email with a link back to
    // the app. Subjects are plain text, so they aren't escaped.
    private void send(String to, String subject, String messageHtml, String path, String linkText) {
        String html = "<p>" + messageHtml + "</p>"
                + "<p><a href=\"" + appUrl + path + "\">" + linkText + "</a></p>"
                + "<p style=\"color:#888;font-size:12px\">MG Player Metric</p>";
        try {
            emailService.send(to, subject, html);
        } catch (Exception e) {
            log.warn("Could not send \"{}\" to {}", subject, to, e);
        }
    }

    // Names, drill titles and comments are typed by users; escaping stops them
    // from adding their own links or markup to the email.
    private static String escape(String text) {
        return text == null ? "" : HtmlUtils.htmlEscape(text);
    }

    // Names are optional on accounts, so emails fall back to a generic one.
    private static String playerName(String name) {
        return name == null || name.isBlank() ? "Your player" : name;
    }

    private static String coachName(String name) {
        return name == null || name.isBlank() ? "Your coach" : name;
    }
}
