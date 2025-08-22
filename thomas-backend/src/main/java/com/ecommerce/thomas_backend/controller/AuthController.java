package com.ecommerce.thomas_backend.controller;

import com.ecommerce.thomas_backend.model.User;
import com.ecommerce.thomas_backend.service.AuthService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.register(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            String token = service.login(request.getUsername(), request.getPassword());
            System.out.println(token);
            return ResponseEntity.ok(new LoginResponse(token,""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new LoginResponse("","Credenciales inválidas"));
        }
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private String error;

        public LoginResponse(String token, String error) {
            this.token = token;
            this.error = error;
        }
    }

}
