package com.ecommerce.thomas_backend.controller;

import com.ecommerce.thomas_backend.model.Inventory;
import com.ecommerce.thomas_backend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    @Autowired
    private InventoryService service;

    @GetMapping
    public List<Inventory> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getById(@PathVariable Long id) {
        Inventory inventory = service.getById(id);
        return inventory != null ? ResponseEntity.ok(inventory) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Inventory> update(@PathVariable Long id, @RequestBody Inventory inventory) {
        Inventory updated = service.update(id, inventory);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
