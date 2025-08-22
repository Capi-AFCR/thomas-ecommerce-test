package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.model.User;
import com.ecommerce.thomas_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository repository;

    public List<User> getAll() {
        return repository.findByActiveTrue();
    }

    public User getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public User create(User user) {
        return repository.save(user);
    }

    public User update(Long id, User user) {
        User existing = getById(id);
        if (existing != null) {
            existing.setUsername(user.getUsername());
            existing.setEmail(user.getEmail());
            existing.setRole(user.getRole());
            // No actualizar password aquí; usar método separado
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public void deactivate(Long id) {
        User user = getById(id);
        if (user != null) {
            user.setActive(false);
            repository.save(user);
        }
    }

    public User findByUsername(String username) {
        return repository.findByUsername(username);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = findByUsername(username);
        if (user == null || !user.isActive()) {
            throw new UsernameNotFoundException("Usuario no encontrado");
        }
        return user;
    }
}
