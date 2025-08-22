package com.ecommerce.thomas_backend.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AuditorAwareImpl implements AuditorAware<String> {
    @Override
    public Optional<String> getCurrentAuditor() {
        String username = SecurityContextHolder.getContext().getAuthentication() != null ?
                SecurityContextHolder.getContext().getAuthentication().getName() : "system";
        return Optional.of(username);
    }
}
