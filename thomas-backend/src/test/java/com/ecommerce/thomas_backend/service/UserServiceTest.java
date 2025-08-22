package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.model.User;
import com.ecommerce.thomas_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("testuser@example.com");
        user.setRole("USER");
        user.setActive(true);
        user.setPassword("hashedPassword");
    }

    @Test
    void testGetAll() {
        // Arrange
        List<User> users = Arrays.asList(user);
        when(userRepository.findByActiveTrue()).thenReturn(users);

        // Act
        List<User> result = userService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("testuser", result.get(0).getUsername());
        verify(userRepository, times(1)).findByActiveTrue();
    }

    @Test
    void testGetAll_EmptyList() {
        // Arrange
        when(userRepository.findByActiveTrue()).thenReturn(Collections.emptyList());

        // Act
        List<User> result = userService.getAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(userRepository, times(1)).findByActiveTrue();
    }

    @Test
    void testGetById_UserExists() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act
        User result = userService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("testuser@example.com", result.getEmail());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testGetById_UserNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        User result = userService.getById(1L);

        // Assert
        assertNull(result);
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testCreate() {
        // Arrange
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(1L);
            return savedUser;
        });

        // Act
        User inputUser = new User();
        inputUser.setUsername("newuser");
        inputUser.setEmail("newuser@example.com");
        inputUser.setRole("USER");
        inputUser.setActive(true);
        User result = userService.create(inputUser);

        // Assert
        assertNotNull(result);
        assertEquals("newuser", result.getUsername());
        assertEquals("newuser@example.com", result.getEmail());
        assertEquals("USER", result.getRole());
        assertEquals(1L, result.getId());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdate_UserExists() {
        // Arrange
        User updatedUser = new User();
        updatedUser.setUsername("updateduser");
        updatedUser.setEmail("updateduser@example.com");
        updatedUser.setRole("ADMIN");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = userService.update(1L, updatedUser);

        // Assert
        assertNotNull(result);
        assertEquals("updateduser", result.getUsername());
        assertEquals("updateduser@example.com", result.getEmail());
        assertEquals("ADMIN", result.getRole());
        assertEquals("hashedPassword", result.getPassword()); // Password no debe cambiar
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdate_UserNotFound() {
        // Arrange
        User updatedUser = new User();
        updatedUser.setUsername("updateduser");
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        User result = userService.update(1L, updatedUser);

        // Assert
        assertNull(result);
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testDelete() {
        // Act
        userService.delete(1L);

        // Assert
        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeactivate_UserExists() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        userService.deactivate(1L);

        // Assert
        assertFalse(user.isActive());
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).save(argThat(savedUser -> !savedUser.isActive()));
    }

    @Test
    void testDeactivate_UserNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        userService.deactivate(1L);

        // Assert
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testFindByUsername_UserExists() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(user);

        // Act
        User result = userService.findByUsername("testuser");

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("testuser@example.com", result.getEmail());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    void testFindByUsername_UserNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(null);

        // Act
        User result = userService.findByUsername("nonexistent");

        // Assert
        assertNull(result);
        verify(userRepository, times(1)).findByUsername("nonexistent");
    }

    @Test
    void testLoadUserByUsername_UserExistsAndActive() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(user);

        // Act
        UserDetails result = userService.loadUserByUsername("testuser");

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertTrue(result.isEnabled());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    void testLoadUserByUsername_UserNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(null);

        // Act & Assert
        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class, () -> {
            userService.loadUserByUsername("nonexistent");
        });
        assertEquals("Usuario no encontrado", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("nonexistent");
    }

    @Test
    void testLoadUserByUsername_UserInactive() {
        // Arrange
        user.setActive(false);
        when(userRepository.findByUsername("testuser")).thenReturn(user);

        // Act & Assert
        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class, () -> {
            userService.loadUserByUsername("testuser");
        });
        assertEquals("Usuario no encontrado", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("testuser");
    }
}