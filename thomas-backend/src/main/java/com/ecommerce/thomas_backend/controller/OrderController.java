package com.ecommerce.thomas_backend.controller;

import com.ecommerce.thomas_backend.dto.OrderRequestDTO;
import com.ecommerce.thomas_backend.dto.OrderResponseDTO;
import com.ecommerce.thomas_backend.model.Order;
import com.ecommerce.thomas_backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAll() {
        return service.getAll();
    }

    @GetMapping("/user")
    public List<Order> getAllByUser(Authentication authentication) {
        return service.getAllByUser(authentication.getName());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getById(@PathVariable Long id) {
        OrderResponseDTO order = service.getById(id);
        return order != null ? ResponseEntity.ok(order) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Order create(@RequestBody OrderRequestDTO orderRequest, Authentication authentication) {
        return service.create(orderRequest, authentication.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> update(@PathVariable Long id, @RequestBody Order order) {
        Order updated = service.update(id, order);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
