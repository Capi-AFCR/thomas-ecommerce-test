package com.ecommerce.thomas_backend.controller;

import com.ecommerce.thomas_backend.dto.ProductRequestDTO;
import com.ecommerce.thomas_backend.model.Product;
import com.ecommerce.thomas_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService service;

    @GetMapping
    public List<Product> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        Product product = service.getById(id);
        return product != null ? ResponseEntity.ok(product) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product create(@RequestBody ProductRequestDTO productRequest) {
        return service.create(productRequest);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        Product updated = service.update(id, product);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam(required = false) String name, @RequestParam(required = false) Double minPrice, @RequestParam(required = false) Double maxPrice) {
        if (name != null) {
            return service.searchByName(name);
        } else if (minPrice != null && maxPrice != null) {
            return service.searchByPrice(minPrice, maxPrice);
        }
        return service.getAll();
    }
}
