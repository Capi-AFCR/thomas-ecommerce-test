package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.model.User;
import com.ecommerce.thomas_backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder encoder;

    @InjectMocks
    private AuthService authService;

    private User user;
    private final String jwtSecret = "mySecretKeyForTesting1234567890mySecretKeyForTesting1234567890"; // 256 bits

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "secret", jwtSecret);

        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPassword("$2a$10$hashedPassword"); // Contraseña codificada simulada
        user.setRole("USER");
    }

    @Test
    void testRegister_Success() {
        // Arrange
        User inputUser = new User();
        inputUser.setUsername("testuser");
        inputUser.setPassword("plainPassword");
        inputUser.setRole("USER");

        //when(encoder.encode("plainPassword")).thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(1L);
            return savedUser;
        });

        // Act
        User result = authService.register(inputUser);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        //assertEquals("$2a$10$hashedPassword", result.getPassword());
        assertEquals("USER", result.getRole());
        assertEquals(1L, result.getId());
        //verify(encoder, times(1)).encode("plainPassword");
        verify(userRepository, times(1)).save(any(User.class));
    }

    /*@Test
    void testLogin_Success() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(user);
        when(encoder.matches("plainPassword", "$2a$10$hashedPassword")).thenReturn(true);

        // Act
        String token = authService.login("testuser", "plainPassword");

        // Assert
        assertNotNull(token);
        // Decodificar y verificar el token
        var claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
        assertEquals("testuser", claims.getSubject());
        assertEquals("USER", claims.get("role"));
        assertNotNull(claims.getIssuedAt());
        assertNotNull(claims.getExpiration());
        // Verificar que la expiración es aproximadamente 1 día después
        long expirationDiff = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
        assertTrue(expirationDiff >= 86400000 - 1000 && expirationDiff <= 86400000 + 1000);
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(encoder, times(1)).matches("plainPassword", "$2a$10$hashedPassword");
    }*/

    @Test
    void testLogin_UserNotFound() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(null);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login("testuser", "plainPassword");
        });
        assertEquals("Credenciales inválidas", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(encoder, never()).matches(anyString(), anyString());
    }

    @Test
    void testLogin_IncorrectPassword() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(user);
        //when(encoder.matches("wrongPassword", "$2a$10$hashedPassword")).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login("testuser", "wrongPassword");
        });
        assertEquals("Credenciales inválidas", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("testuser");
        //verify(encoder, times(1)).matches("wrongPassword", "$2a$10$hashedPassword");
    }
}