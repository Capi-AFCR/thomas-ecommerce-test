package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.model.Inventory;
import com.ecommerce.thomas_backend.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {
    @Autowired
    private InventoryRepository repository;

    public List<Inventory> getAll() {
        return repository.findAll();
    }

    public Inventory getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Inventory findByProductId(Long productId) {
        return repository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado para el producto con ID: " + productId));
    }

    public Inventory update(Long id, Inventory inventory) {
        Inventory existing = getById(id);
        if (existing != null) {
            existing.setStock(inventory.getStock());
            return repository.save(existing);
        }
        return null;
    }

    public Inventory updateStock(Inventory inventory) {
        return repository.save(inventory);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

}
