package com.patternforge.controller;

import com.patternforge.config.JwtUtils;
import com.patternforge.dto.AuthRequest;
import com.patternforge.dto.AuthResponse;
import com.patternforge.dto.RegisterRequest;
import com.patternforge.model.Settings;
import com.patternforge.model.User;
import com.patternforge.repository.SettingsRepository;
import com.patternforge.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final SettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(UserRepository userRepository,
                          SettingsRepository settingsRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByUsernameIgnoreCase(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken.");
        }
        if (userRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        User savedUser = userRepository.save(user);

        // Initialize default settings for user
        Settings settings = Settings.builder()
                .user(savedUser)
                .darkMode(true)
                .editorTheme("vs-dark")
                .fontSize(14)
                .tabSize(4)
                .autosaveInterval(30)
                .keyboardShortcutsEnabled(true)
                .build();
        settingsRepository.save(settings);

        String token = jwtUtils.generateToken(savedUser.getUsername(), savedUser.getId());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .username(savedUser.getUsername())
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(request.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmailIgnoreCase(request.getUsername()); // allow logging in with email
        }

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.badRequest().body("Invalid username/email or password.");
        }

        User user = userOpt.get();
        String token = jwtUtils.generateToken(user.getUsername(), user.getId());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .userId(user.getId())
                .email(user.getEmail())
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (jwtUtils.validateToken(token)) {
            UUID userId = jwtUtils.getUserIdFromToken(token);
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return ResponseEntity.ok(AuthResponse.builder()
                        .token(token)
                        .username(user.getUsername())
                        .userId(user.getId())
                        .email(user.getEmail())
                        .build());
            }
        }
        return ResponseEntity.status(401).body("Invalid or expired session");
    }
}
