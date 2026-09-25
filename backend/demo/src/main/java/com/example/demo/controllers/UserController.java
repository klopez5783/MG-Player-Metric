package com.example.demo.controllers;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dto.MeResponse;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.entities.Coaches;
import com.example.demo.entities.Players;
import com.example.demo.entities.User;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;


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

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(toMeResponse(user));
    }

    // Update the caller's own profile (currently just the name)
    @PutMapping("/me")
    public ResponseEntity<MeResponse> updateMe(@AuthenticationPrincipal Jwt jwt, @RequestBody UpdateProfileRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        UUID id = UUID.fromString(jwt.getSubject());
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setName(request.name().trim());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(toMeResponse(user));
    }

    private MeResponse toMeResponse(User user) {
        UUID coachId = null;
        String coachName = null;
        if ("player".equals(user.getRole())) {
            Coaches coach = playerRepository.findById(user.getId())
                .map(Players::getCoach)          // empty if the player has no coach
                .orElse(null);
            if (coach != null) {
                coachId = coach.getId();
                coachName = coach.getUser().getName();
            }
        }
        return new MeResponse(user.getId(), user.getEmail(), user.getName(), user.getRole(), coachId, coachName);
    }
}
