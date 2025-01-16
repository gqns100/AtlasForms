package com.example.rbacsystem.controller;

import com.example.rbacsystem.dto.LoginRequest;
import com.example.rbacsystem.dto.LoginResponse;
import com.example.rbacsystem.model.User;
import com.example.rbacsystem.model.Role;
import com.example.rbacsystem.mapper.UserMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                         UserMapper userMapper,
                         PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // For simplicity, using UUID as token. In production, use JWT
        String token = UUID.randomUUID().toString();
        
        User user = userMapper.findByUsername(loginRequest.getUsername()).orElseThrow();
        String[] roleNames = user.getRoles().stream()
            .map(Role::getName)
            .toArray(String[]::new);
        return ResponseEntity.ok(new LoginResponse(token, user.getUsername(), roleNames));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().body("Logged out successfully");
    }
}
