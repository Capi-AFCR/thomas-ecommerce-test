package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.dto.OrderRequestDTO;
import com.ecommerce.thomas_backend.dto.OrderResponseDTO;
import com.ecommerce.thomas_backend.model.*;
import com.ecommerce.thomas_backend.repository.OrderDetailRepository;
import com.ecommerce.thomas_backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @Mock
    private ProductService productService;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private UserService userService;

    @InjectMocks
    private OrderService orderService;

    private User user;
    private Product product;
    private Inventory inventory;
    private Order order;
    private OrderRequestDTO orderRequestDTO;
    private OrderRequestDTO.ProductQuantity productOrderDTO;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(orderService, "discountStartTime", "2025-08-20T00:00:00");
        ReflectionTestUtils.setField(orderService, "discountEndTime", "2025-08-31T23:59:59");
        ReflectionTestUtils.setField(orderService, "frequentCustomerThreshold", 5);

        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        product = new Product();
        product.setId(1L);
        product.setName("Producto 1");
        product.setPrice(100.0);

        inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setStock(10);

        order = new Order();
        order.setId(1L);
        order.setUser(user);
        order.setDate(LocalDateTime.of(2025, 8, 25, 12, 0));
        order.setTotal(180.0);
        order.setIsRandomOrder(false);

        productOrderDTO = new OrderRequestDTO.ProductQuantity();
        productOrderDTO.setProductId(1L);
        productOrderDTO.setQuantity(2);
        productOrderDTO.setIsRandomOrder(false);

        orderRequestDTO = new OrderRequestDTO();
        orderRequestDTO.setProducts(Arrays.asList(productOrderDTO));
    }

    @Test
    void testGetAll() {
        // Arrange
        when(orderRepository.findAll()).thenReturn(Arrays.asList(order));

        // Act
        List<Order> result = orderService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("testuser", result.get(0).getUser().getUsername());
        verify(orderRepository, times(1)).findAll();
    }

    @Test
    void testGetAll_EmptyList() {
        // Arrange
        when(orderRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<Order> result = orderService.getAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderRepository, times(1)).findAll();
    }

    @Test
    void testGetOrderById_OrderExists() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // Act
        Order result = orderService.getOrderById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(180.0, result.getTotal(), 0.01);
        verify(orderRepository, times(1)).findById(1L);
    }

    @Test
    void testGetOrderById_OrderNotFound() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Order result = orderService.getOrderById(1L);

        // Assert
        assertNull(result);
        verify(orderRepository, times(1)).findById(1L);
    }

    @Test
    void testGetById_OrderExists() {
        // Arrange
        OrderDetail orderDetail = new OrderDetail();
        orderDetail.setOrder(order);
        orderDetail.setProduct(product);
        orderDetail.setQuantity(2);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderDetailRepository.findByOrderId(1L)).thenReturn(Arrays.asList(orderDetail));

        // Act
        OrderResponseDTO result = orderService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(order, result.order);
        assertEquals(1, result.orderDetail.size());
        assertEquals(2, result.orderDetail.get(0).getQuantity());
        verify(orderRepository, times(1)).findById(1L);
        verify(orderDetailRepository, times(1)).findByOrderId(1L);
    }

    @Test
    void testGetById_OrderNotFound() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        OrderResponseDTO result = orderService.getById(1L);

        // Assert
        assertNotNull(result);
        assertNull(result.order);
        assertTrue(result.orderDetail.isEmpty());
        verify(orderRepository, times(1)).findById(1L);
        verify(orderDetailRepository, times(1)).findByOrderId(1L);
    }

    @Test
    void testGetDetailByOrderId() {
        // Arrange
        OrderDetail orderDetail = new OrderDetail();
        orderDetail.setOrder(order);
        orderDetail.setProduct(product);
        orderDetail.setQuantity(2);

        when(orderDetailRepository.findByOrderId(1L)).thenReturn(Arrays.asList(orderDetail));

        // Act
        List<OrderDetail> result = orderService.getDetailByOrderId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(2, result.get(0).getQuantity());
        verify(orderDetailRepository, times(1)).findByOrderId(1L);
    }

    @Test
    void testGetDetailByOrderId_NoDetails() {
        // Arrange
        when(orderDetailRepository.findByOrderId(1L)).thenReturn(Collections.emptyList());

        // Act
        List<OrderDetail> result = orderService.getDetailByOrderId(1L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderDetailRepository, times(1)).findByOrderId(1L);
    }

    @Test
    void testCreate_RegularOrderInDiscountPeriod() {
        // Arrange
        when(userService.findByUsername("testuser")).thenReturn(user);
        when(productService.getById(1L)).thenReturn(product);
        when(inventoryService.findByProductId(1L)).thenReturn(inventory);
        when(orderRepository.countByUserId(1L)).thenReturn(3L); // No cliente frecuente
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order savedOrder = invocation.getArgument(0);
            savedOrder.setId(1L);
            return savedOrder;
        });
        when(inventoryService.updateStock(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderDetailRepository.save(any(OrderDetail.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Order result = orderService.create(orderRequestDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(180.0, result.getTotal(), 0.01); // 100 * 2 * (1 - 0.10) = 180
        assertEquals(false, result.getIsRandomOrder());
        assertEquals(user, result.getUser());
        verify(inventoryService, times(1)).updateStock(argThat(inv -> inv.getStock() == 8));
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderDetailRepository, times(1)).save(argThat(detail ->
                detail.getProduct().getId().equals(1L) && detail.getQuantity() == 2
        ));
    }

    @Test
    void testCreate_RandomOrderInDiscountPeriod() {
        // Arrange
        productOrderDTO.setIsRandomOrder(true);
        orderRequestDTO.setProducts(Arrays.asList(productOrderDTO));

        when(userService.findByUsername("testuser")).thenReturn(user);
        when(productService.getById(1L)).thenReturn(product);
        when(inventoryService.findByProductId(1L)).thenReturn(inventory);
        when(orderRepository.countByUserId(1L)).thenReturn(3L); // No cliente frecuente
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order savedOrder = invocation.getArgument(0);
            savedOrder.setId(1L);
            return savedOrder;
        });
        when(inventoryService.updateStock(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderDetailRepository.save(any(OrderDetail.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Order result = orderService.create(orderRequestDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(100.0, result.getTotal(), 0.01); // 100 * 2 * (1 - 0.50) = 100
        assertEquals(true, result.getIsRandomOrder());
        assertEquals(user, result.getUser());
        verify(inventoryService, times(1)).updateStock(argThat(inv -> inv.getStock() == 8));
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderDetailRepository, times(1)).save(argThat(detail ->
                detail.getProduct().getId().equals(1L) && detail.getQuantity() == 2
        ));
    }

    @Test
    void testCreate_FrequentCustomerRandomOrder() {
        // Arrange
        productOrderDTO.setIsRandomOrder(true);
        orderRequestDTO.setProducts(Arrays.asList(productOrderDTO));

        when(userService.findByUsername("testuser")).thenReturn(user);
        when(productService.getById(1L)).thenReturn(product);
        when(inventoryService.findByProductId(1L)).thenReturn(inventory);
        when(orderRepository.countByUserId(1L)).thenReturn(6L); // Cliente frecuente
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order savedOrder = invocation.getArgument(0);
            savedOrder.setId(1L);
            return savedOrder;
        });
        when(inventoryService.updateStock(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderDetailRepository.save(any(OrderDetail.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Order result = orderService.create(orderRequestDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(90.0, result.getTotal(), 0.01); // 100 * 2 * (1 - 0.50 - 0.05) = 90
        assertEquals(true, result.getIsRandomOrder());
        assertEquals(user, result.getUser());
        verify(inventoryService, times(1)).updateStock(argThat(inv -> inv.getStock() == 8));
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderDetailRepository, times(1)).save(argThat(detail ->
                detail.getProduct().getId().equals(1L) && detail.getQuantity() == 2
        ));
    }

    @Test
    void testCreate_InsufficientStock() {
        // Arrange
        inventory.setStock(1); // Stock insuficiente
        when(userService.findByUsername("testuser")).thenReturn(user);
        when(productService.getById(1L)).thenReturn(product);
        when(inventoryService.findByProductId(1L)).thenReturn(inventory);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.create(orderRequestDTO, "testuser");
        });
        assertEquals("Stock insuficiente para el producto Producto 1", exception.getMessage());
        verify(inventoryService, never()).updateStock(any());
        verify(orderRepository, never()).save(any());
        verify(orderDetailRepository, never()).save(any());
    }

    @Test
    void testCreate_UserNotFound() {
        // Arrange
        when(userService.findByUsername("testuser")).thenReturn(null);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.create(orderRequestDTO, "testuser");
        });
        assertEquals("Usuario no encontrado", exception.getMessage());
        verify(userService, times(1)).findByUsername("testuser");
        verify(productService, never()).getById(any());
        verify(inventoryService, never()).findByProductId(any());
        verify(orderRepository, never()).save(any());
        verify(orderDetailRepository, never()).save(any());
    }

    @Test
    void testUpdate_OrderExists() {
        // Arrange
        Order updatedOrder = new Order();
        updatedOrder.setTotal(200.0);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Order result = orderService.update(1L, updatedOrder);

        // Assert
        assertNotNull(result);
        assertEquals(200.0, result.getTotal(), 0.01);
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void testUpdate_OrderNotFound() {
        // Arrange
        Order updatedOrder = new Order();
        updatedOrder.setTotal(200.0);

        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Order result = orderService.update(1L, updatedOrder);

        // Assert
        assertNull(result);
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, never()).save(any());
    }

    @Test
    void testDelete() {
        // Act
        orderService.delete(1L);

        // Assert
        verify(orderRepository, times(1)).deleteById(1L);
    }
}