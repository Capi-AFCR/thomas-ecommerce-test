package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.model.User;
import com.ecommerce.thomas_backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuthService {
    @Autowired
    private UserRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Value("${jwt.secret}")
    private String secret;

    public User register(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return repository.save(user);
    }

    public String login(String username, String password) {
        User user = repository.findByUsername(username);
        if (user != null && encoder.matches(password, user.getPassword())) {
            return Jwts.builder()
                    .setSubject(username)
                    .claim("role",user.getRole())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 día
                    .signWith(Keys.hmacShaKeyFor(secret.getBytes()), SignatureAlgorithm.HS512)
                    .compact();
        } else {
            throw new RuntimeException("Credenciales inválidas");
        }
    }
}
