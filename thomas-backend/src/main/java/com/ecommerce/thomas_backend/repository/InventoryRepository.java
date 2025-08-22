package com.ecommerce.thomas_backend.repository;

import com.ecommerce.thomas_backend.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);
}
