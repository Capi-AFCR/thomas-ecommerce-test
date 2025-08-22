package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.model.Inventory;
import com.ecommerce.thomas_backend.model.Product;
import com.ecommerce.thomas_backend.repository.InventoryRepository;
import com.ecommerce.thomas_backend.repository.OrderDetailRepository;
import com.ecommerce.thomas_backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @InjectMocks
    private ReportService reportService;

    private Product product1;
    private Product product2;
    private Inventory inventory1;
    private Inventory inventory2;

    @BeforeEach
    void setUp() {
        product1 = new Product();
        product1.setId(1L);
        product1.setName("Producto 1");
        product1.setPrice(100.0);

        product2 = new Product();
        product2.setId(2L);
        product2.setName("Producto 2");
        product2.setPrice(200.0);

        inventory1 = new Inventory();
        inventory1.setStock(10);
        inventory1.setProduct(product1);

        inventory2 = new Inventory();
        inventory2.setStock(0); // Sin stock
        inventory2.setProduct(product2);
    }

    @Test
    void testGetActiveProducts_WithStock() {
        // Arrange
        when(inventoryRepository.findAll()).thenReturn(Arrays.asList(inventory1, inventory2));

        // Act
        List<Product> result = reportService.getActiveProducts();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Producto 1", result.get(0).getName());
        assertEquals(100.0, result.get(0).getPrice(), 0.01);
        verify(inventoryRepository, times(1)).findAll();
    }

    @Test
    void testGetActiveProducts_NoStock() {
        // Arrange
        inventory1.setStock(0); // Sin stock
        when(inventoryRepository.findAll()).thenReturn(Arrays.asList(inventory1, inventory2));

        // Act
        List<Product> result = reportService.getActiveProducts();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(inventoryRepository, times(1)).findAll();
    }

    @Test
    void testGetActiveProducts_EmptyInventory() {
        // Arrange
        when(inventoryRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<Product> result = reportService.getActiveProducts();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(inventoryRepository, times(1)).findAll();
    }

    @Test
    void testGetTop5SoldProducts() {
        // Arrange
        Object[] productSale1 = new Object[]{product1, 50L}; // Producto 1, 50 unidades vendidas
        Object[] productSale2 = new Object[]{product2, 30L}; // Producto 2, 30 unidades vendidas
        List<Object[]> topProducts = Arrays.asList(productSale1, productSale2);
        when(orderDetailRepository.findTop5SoldProducts()).thenReturn(topProducts);

        // Act
        List<Object[]> result = reportService.getTop5SoldProducts();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(product1, result.get(0)[0]);
        assertEquals(50L, result.get(0)[1]);
        assertEquals(product2, result.get(1)[0]);
        assertEquals(30L, result.get(1)[1]);
        verify(orderDetailRepository, times(1)).findTop5SoldProducts();
    }

    @Test
    void testGetTop5SoldProducts_NoSales() {
        // Arrange
        when(orderDetailRepository.findTop5SoldProducts()).thenReturn(Collections.emptyList());

        // Act
        List<Object[]> result = reportService.getTop5SoldProducts();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderDetailRepository, times(1)).findTop5SoldProducts();
    }

    @Test
    void testGetTop5Clients() {
        // Arrange
        Object[] client1 = new Object[]{1L, "user1", 10L}; // ID, username, 10 órdenes
        Object[] client2 = new Object[]{2L, "user2", 8L};  // ID, username, 8 órdenes
        List<Object[]> topClients = Arrays.asList(client1, client2);
        when(orderRepository.findTop5Clients()).thenReturn(topClients);

        // Act
        List<Object[]> result = reportService.getTop5Clients();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(1L, result.get(0)[0]);
        assertEquals("user1", result.get(0)[1]);
        assertEquals(10L, result.get(0)[2]);
        assertEquals(2L, result.get(1)[0]);
        assertEquals("user2", result.get(1)[1]);
        assertEquals(8L, result.get(1)[2]);
        verify(orderRepository, times(1)).findTop5Clients();
    }

    @Test
    void testGetTop5Clients_NoClients() {
        // Arrange
        when(orderRepository.findTop5Clients()).thenReturn(Collections.emptyList());

        // Act
        List<Object[]> result = reportService.getTop5Clients();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderRepository, times(1)).findTop5Clients();
    }
}