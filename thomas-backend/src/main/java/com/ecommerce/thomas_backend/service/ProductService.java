package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.dto.ProductRequestDTO;
import com.ecommerce.thomas_backend.model.Inventory;
import com.ecommerce.thomas_backend.model.Product;
import com.ecommerce.thomas_backend.repository.InventoryRepository;
import com.ecommerce.thomas_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository repository;
    @Autowired
    private InventoryRepository invRepository;

    public List<Product> getAll() {
        return repository.findAll();
    }

    public Product getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public Product create(ProductRequestDTO productRequest) {
        Product product = new Product();
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product = repository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setStock(productRequest.getInitialStock());
        invRepository.save(inventory);

        return product;
    }

    public Product update(Long id, Product product) {
        Product existing = getById(id);
        if (existing != null) {
            existing.setName(product.getName());
            existing.setDescription(product.getDescription());
            existing.setPrice(product.getPrice());
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Product> searchByName(String nombre) {
        return repository.findByNameContaining(nombre);
    }

    public List<Product> searchByPrice(Double min, Double max) {
        return repository.findByPriceBetween(min, max);
    }
}
