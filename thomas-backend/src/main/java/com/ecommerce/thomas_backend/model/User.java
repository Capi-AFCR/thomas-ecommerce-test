package com.ecommerce.thomas_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails {
    @Id
    @GeneratedValue
    private Long id;
    @NotNull
    private String username;
    @NotNull
    private String password; // Encriptada
    @NotNull
    private String email;
    @NotNull
    private String role; // "USER" o "ADMIN"
    @NotNull
    private boolean active = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "ROLE_" + role);
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}