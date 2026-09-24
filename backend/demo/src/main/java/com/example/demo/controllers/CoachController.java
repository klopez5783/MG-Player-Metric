package com.example.demo.controllers;

import java.security.SecureRandom;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.dto.InviteCodeResponse;
import com.example.demo.entities.Coaches;
import com.example.demo.repositories.CoachRepository;


@RestController
@RequestMapping("/coaches")
public class CoachController {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CoachRepository coachRepository;
    private final PlayerRepository playerRepository;

    public CoachController(CoachRepository coachRepository, PlayerRepository playerRepository) {
        this.coachRepository = coachRepository;
        this.playerRepository = playerRepository;
    }

    @GetMapping("/me/invite-code")
    @Transactional
    public ResponseEntity<InviteCodeResponse> myInviteCode(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject());
        Coaches coach = coachRepository.findById(id).orElse(null);

        if (coach.getInviteCode() == null) {
            String inviteCode = generateUniqueCode();
            coach.setInviteCode(inviteCode);
            coachRepository.save(coach);
        }

        return ResponseEntity.ok(new InviteCodeResponse(coach.getInviteCode()));
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = generateCode();
        } while (coachRepository.existsByInviteCode(code));
        return code;
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
