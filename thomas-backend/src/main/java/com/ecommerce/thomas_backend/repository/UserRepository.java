package com.ecommerce.thomas_backend.repository;

import com.ecommerce.thomas_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    List<User> findByActiveTrue(); // Método para listar solo usuarios activos
}