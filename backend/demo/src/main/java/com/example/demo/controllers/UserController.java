package com.example.demo.controllers;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dto.MeResponse;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
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

    // Just the account. Coaches belong to each player, so they come from
    // GET /players/me instead.
    private MeResponse toMeResponse(User user) {
        return new MeResponse(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }
}
