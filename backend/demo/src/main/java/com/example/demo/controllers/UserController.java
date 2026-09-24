package com.example.demo.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dto.MeResponse;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;

    public UserController(UserRepository userRepository, PlayerRepository playerRepository) {
        this.userRepository = userRepository;
        this.playerRepository = playerRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject());

        return userRepository.findById(id)
            .map(user -> {
                UUID coachId = null;
                if ("player".equals(user.getRole())) {
                    coachId = playerRepository.findById(id)
                        .map(p -> p.getCoach() == null ? null : p.getCoach().getId())
                        .orElse(null);
                }
                return ResponseEntity.ok(new MeResponse(user.getId(), user.getEmail(), user.getRole(), coachId));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

