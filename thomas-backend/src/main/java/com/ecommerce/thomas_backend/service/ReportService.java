package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.model.Inventory;
import com.ecommerce.thomas_backend.model.Product;
import com.ecommerce.thomas_backend.repository.InventoryRepository;
import com.ecommerce.thomas_backend.repository.OrderDetailRepository;
import com.ecommerce.thomas_backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderDetailRepository orderDetailRepository;

    public List<Product> getActiveProducts() {
        return inventoryRepository.findAll().stream()
                .filter(i -> i.getStock() > 0)
                .map(Inventory::getProduct)
                .collect(Collectors.toList());
    }

    public List<Object[]> getTop5SoldProducts() {
        return orderDetailRepository.findTop5SoldProducts();
    }

    public List<Object[]> getTop5Clients() {
        return orderRepository.findTop5Clients();
    }
}
