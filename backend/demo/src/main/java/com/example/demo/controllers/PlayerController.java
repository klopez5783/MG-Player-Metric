package com.example.demo.controllers;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.CoachRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dto.JoinCoachRequest;
import com.example.demo.entities.Coaches;
import com.example.demo.entities.Players;


@RestController
@RequestMapping("/players")
public class PlayerController {

    private final PlayerRepository playerRepository;
    private final CoachRepository coachRepository;

    public PlayerController(PlayerRepository playerRepository, CoachRepository coachRepository) {
        this.playerRepository = playerRepository;
        this.coachRepository = coachRepository;
    }

    // Player joins a coach with the code
    @PostMapping("/me/coach")
    @Transactional
    public ResponseEntity<Void> joinCoach(@AuthenticationPrincipal Jwt jwt, @RequestBody JoinCoachRequest request) {
        UUID id = UUID.fromString(jwt.getSubject());
        Players player = playerRepository.findById(id).orElse(null);
        if (player == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();  // not a player
        if (player.getCoach() != null) return ResponseEntity.status(HttpStatus.CONFLICT).build();  // already linked

        String code = request.code() == null ? "" : request.code().trim().toUpperCase();
        Coaches coach = coachRepository.findByInviteCode(code).orElse(null);
        if (coach == null) return ResponseEntity.notFound().build();  // wrong code

        player.setCoach(coach);
        player.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/coach")
    @Transactional
    public ResponseEntity<Void> leaveCoach(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject());
        Players player = playerRepository.findById(id).orElse(null);
        if (player == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();      // not a player
        if (player.getCoach() == null) return ResponseEntity.status(HttpStatus.CONFLICT).build();  // no coach to leave

        player.setCoach(null);
        player.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.noContent().build();
    }
}
