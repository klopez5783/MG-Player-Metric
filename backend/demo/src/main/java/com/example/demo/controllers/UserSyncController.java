package com.example.demo.controllers;

import com.example.demo.dto.SyncUserRequest;
import com.example.demo.dto.SyncUserResponse;
import com.example.demo.entities.Coaches;
import com.example.demo.entities.Players;
import com.example.demo.entities.User;
import com.example.demo.repositories.CoachRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserSyncController {

    private static final Set<String> VALID_ROLES = Set.of("coach", "player");

    private final UserRepository userRepository;
    private final CoachRepository coachRepository;
    private final PlayerRepository playerRepository;

    public UserSyncController(UserRepository userRepository, CoachRepository coachRepository,
            PlayerRepository playerRepository) {
        this.userRepository = userRepository;
        this.coachRepository = coachRepository;
        this.playerRepository = playerRepository;
    }

    @PostMapping("/sync")
    @Transactional
    public ResponseEntity<SyncUserResponse> sync(@AuthenticationPrincipal Jwt jwt, @RequestBody SyncUserRequest request) {
        if (request.role() == null || !VALID_ROLES.contains(request.role().toLowerCase())) {
            return ResponseEntity.badRequest().build();
        }
        String role = request.role().toLowerCase();

        UUID userId = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");

        User user = userRepository.findById(userId).orElseGet(() -> {
            LocalDateTime now = LocalDateTime.now();
            User newUser = new User();
            newUser.setId(userId);
            newUser.setEmail(email);
            newUser.setRole(role);
            newUser.setCreatedAt(now);
            newUser.setUpdatedAt(now);
            return userRepository.save(newUser);
        });

        if (role.equals("coach")) {
            if (coachRepository.findById(userId).isEmpty()) {
                Coaches coach = new Coaches();
                coach.setUser(user);
                coachRepository.save(coach);
            }
        } else {
            if (playerRepository.findById(userId).isEmpty()) {
                LocalDateTime now = LocalDateTime.now();
                Players player = new Players();
                player.setUser(user);
                player.setCreatedAt(now);
                player.setUpdatedAt(now);
                playerRepository.save(player);
            }
        }

        return ResponseEntity.ok(new SyncUserResponse(user.getId(), user.getEmail(), user.getRole()));
    }
}
