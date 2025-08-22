package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.model.Inventory;
import com.ecommerce.thomas_backend.model.Product;
import com.ecommerce.thomas_backend.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private Inventory inventory;
    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Producto 1");
        product.setPrice(100.0);

        inventory = new Inventory();
        inventory.setId(1L);
        inventory.setProduct(product);
        inventory.setStock(10);
    }

    @Test
    void testGetAll() {
        // Arrange
        List<Inventory> inventories = Arrays.asList(inventory);
        when(inventoryRepository.findAll()).thenReturn(inventories);

        // Act
        List<Inventory> result = inventoryService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals(10, result.get(0).getStock());
        verify(inventoryRepository, times(1)).findAll();
    }

    @Test
    void testGetAll_EmptyList() {
        // Arrange
        when(inventoryRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<Inventory> result = inventoryService.getAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(inventoryRepository, times(1)).findAll();
    }

    @Test
    void testGetById_InventoryExists() {
        // Arrange
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));

        // Act
        Inventory result = inventoryService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(10, result.getStock());
        verify(inventoryRepository, times(1)).findById(1L);
    }

    @Test
    void testGetById_InventoryNotFound() {
        // Arrange
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Inventory result = inventoryService.getById(1L);

        // Assert
        assertNull(result);
        verify(inventoryRepository, times(1)).findById(1L);
    }

    @Test
    void testFindByProductId_InventoryExists() {
        // Arrange
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));

        // Act
        Inventory result = inventoryService.findByProductId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getProduct().getId());
        assertEquals(10, result.getStock());
        verify(inventoryRepository, times(1)).findByProductId(1L);
    }

    @Test
    void testFindByProductId_InventoryNotFound() {
        // Arrange
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            inventoryService.findByProductId(1L);
        });
        assertEquals("Inventario no encontrado para el producto con ID: 1", exception.getMessage());
        verify(inventoryRepository, times(1)).findByProductId(1L);
    }

    @Test
    void testUpdate_InventoryExists() {
        // Arrange
        Inventory updatedInventory = new Inventory();
        updatedInventory.setStock(20);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Inventory result = inventoryService.update(1L, updatedInventory);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(20, result.getStock());
        verify(inventoryRepository, times(1)).findById(1L);
        verify(inventoryRepository, times(1)).save(any(Inventory.class));
    }

    @Test
    void testUpdate_InventoryNotFound() {
        // Arrange
        Inventory updatedInventory = new Inventory();
        updatedInventory.setStock(20);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Inventory result = inventoryService.update(1L, updatedInventory);

        // Assert
        assertNull(result);
        verify(inventoryRepository, times(1)).findById(1L);
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void testUpdateStock() {
        // Arrange
        inventory.setStock(15);
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Inventory result = inventoryService.updateStock(inventory);

        // Assert
        assertNotNull(result);
        assertEquals(15, result.getStock());
        verify(inventoryRepository, times(1)).save(any(Inventory.class));
    }

    @Test
    void testDelete() {
        // Act
        inventoryService.delete(1L);

        // Assert
        verify(inventoryRepository, times(1)).deleteById(1L);
    }
}