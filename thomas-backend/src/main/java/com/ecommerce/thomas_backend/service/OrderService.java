package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.dto.OrderRequestDTO;
import com.ecommerce.thomas_backend.dto.OrderResponseDTO;
import com.ecommerce.thomas_backend.model.*;
import com.ecommerce.thomas_backend.repository.OrderDetailRepository;
import com.ecommerce.thomas_backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderDetailRepository detailRepository;
    @Autowired
    private ProductService productService;
    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private UserService userService;

    @Value("${discount.start-time}")
    private String discountStartTime;

    @Value("${discount.end-time}")
    private String discountEndTime;

    @Value("${discount.frequent-customer-threshold:5}")
    private int frequentCustomerThreshold;

    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    public List<Order> getAllByUser(String username) {
        User user = userService.findByUsername(username);
        return orderRepository.findByUserId(user.getId());
    }

    public Order getOrderById(Long id){
        return orderRepository.findById(id).orElse(null);
    }

    public OrderResponseDTO getById(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        List<OrderDetail> orderDetail = getDetailByOrderId(id);
        //
        OrderResponseDTO orderResponse = new OrderResponseDTO();
        orderResponse.order = order;
        orderResponse.orderDetail = orderDetail;
        return orderResponse;
    }

    public List<OrderDetail> getDetailByOrderId(Long id) {
        return detailRepository.findByOrderId(id);
    }

    @Transactional
    public Order create(OrderRequestDTO orderRequest, String username) {
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado");
        }
        Order order = new Order();
        order.setUser(user);
        order.setDate(LocalDateTime.now());
        double total = 0.0;
        order.setIsRandomOrder(orderRequest.getIsRandomOrder());
        for (int i = 0; i < orderRequest.getProducts().size(); i++) {
            Long prodId = orderRequest.getProducts().get(i).getProductId();
            Double quantity = orderRequest.getProducts().get(i).getQuantity().doubleValue();
            Product prod = productService.getById(prodId);
            total += prod.getPrice() * quantity;
            // Reducir stock
            Inventory inventory = inventoryService.findByProductId(prodId);
            if (inventory.getStock() < quantity) {
                throw new RuntimeException("Stock insuficiente para el producto " + prod.getName());
            }
            inventory.setStock(inventory.getStock() - orderRequest.getProducts().get(i).getQuantity());
            inventoryService.updateStock(inventory);
        }

        // Aplicar descuentos
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = LocalDateTime.parse(discountStartTime);
        LocalDateTime endTime = LocalDateTime.parse(discountEndTime);
        boolean isWithinDiscountPeriod = now.isAfter(startTime) && now.isBefore(endTime);

        double discount = 0.0;
        if (isWithinDiscountPeriod) {
            if (orderRequest.getIsRandomOrder()) {
                discount += 0.50; // 50% para pedidos aleatorios
            } else {
                discount += 0.10; // 10% para órdenes regulares
            }
        }

        // Descuento adicional para clientes frecuentes
        long orderCount = orderRepository.countByUserId(user.getId());
        if (orderCount >= frequentCustomerThreshold) {
            discount += 0.05; // 5% adicional
        }

        // Aplicar descuento al total
        total = total * (1.0 - discount);

        order.setTotal(new BigDecimal(total).setScale(2, RoundingMode.HALF_UP).doubleValue());
        order = orderRepository.save(order);

        for (int i = 0; i < orderRequest.getProducts().size(); i++) {
            OrderDetail orderDetail = new OrderDetail();
            Product prod = productService.getById(orderRequest.getProducts().get(i).getProductId());
            orderDetail.setOrder(order);
            orderDetail.setProduct(prod);
            orderDetail.setQuantity(orderRequest.getProducts().get(i).getQuantity());
            detailRepository.save(orderDetail);
        }
        return order;
    }

    public Order update(Long id, Order order) {
        Order existing = getOrderById(id);
        if (existing != null) {
            existing.setTotal(order.getTotal());
            return orderRepository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        orderRepository.deleteById(id);
    }
}
