package com.ecommerce.thomas_backend.repository;

import com.ecommerce.thomas_backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContaining(String name);
    List<Product> findByPriceBetween(Double min, Double max);
}
