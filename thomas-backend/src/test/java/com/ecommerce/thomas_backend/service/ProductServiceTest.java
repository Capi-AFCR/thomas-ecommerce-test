package com.ecommerce.thomas_backend.service;

import com.ecommerce.thomas_backend.dto.ProductRequestDTO;
import com.ecommerce.thomas_backend.model.Inventory;
import com.ecommerce.thomas_backend.model.Product;
import com.ecommerce.thomas_backend.repository.InventoryRepository;
import com.ecommerce.thomas_backend.repository.ProductRepository;
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
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private ProductRequestDTO productRequestDTO;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Product 1");
        product.setDescription("Descripción del producto 1");
        product.setPrice(100.0);

        productRequestDTO = new ProductRequestDTO();
        productRequestDTO.setName("Product 1");
        productRequestDTO.setDescription("Descripción del producto 1");
        productRequestDTO.setPrice(100.0);
        productRequestDTO.setInitialStock(50);
    }

    @Test
    void testGetAll() {
        // Arrange
        List<Product> products = Arrays.asList(product);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        List<Product> result = productService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Product 1", result.get(0).getName());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void testGetAll_EmptyList() {
        // Arrange
        when(productRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<Product> result = productService.getAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void testGetById_ProductExists() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        Product result = productService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("Product 1", result.getName());
        assertEquals(100.0, result.getPrice(), 0.01);
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void testGetById_ProductNotFound() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Product result = productService.getById(1L);

        // Assert
        assertNull(result);
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void testCreate() {
        // Arrange
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product savedProduct = invocation.getArgument(0);
            savedProduct.setId(1L);
            return savedProduct;
        });
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Product result = productService.create(productRequestDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Product 1", result.getName());
        assertEquals("Descripción del producto 1", result.getDescription());
        assertEquals(100.0, result.getPrice(), 0.01);
        verify(productRepository, times(1)).save(any(Product.class));
        verify(inventoryRepository, times(1)).save(argThat(inventory ->
                inventory.getProduct().getId().equals(1L) && inventory.getStock() == 50
        ));
    }

    @Test
    void testUpdate_ProductExists() {
        // Arrange
        Product updatedProduct = new Product();
        updatedProduct.setName("Producto Actualizado");
        updatedProduct.setDescription("Descripción Actualizada");
        updatedProduct.setPrice(150.0);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Product result = productService.update(1L, updatedProduct);

        // Assert
        assertNotNull(result);
        assertEquals("Producto Actualizado", result.getName());
        assertEquals("Descripción Actualizada", result.getDescription());
        assertEquals(150.0, result.getPrice(), 0.01);
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testUpdate_ProductNotFound() {
        // Arrange
        Product updatedProduct = new Product();
        updatedProduct.setName("Producto Actualizado");
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Product result = productService.update(1L, updatedProduct);

        // Assert
        assertNull(result);
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void testDelete() {
        // Act
        productService.delete(1L);

        // Assert
        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    void testSearchByName() {
        // Arrange
        List<Product> products = Arrays.asList(product);
        when(productRepository.findByNameContaining("Product")).thenReturn(products);

        // Act
        List<Product> result = productService.searchByName("Product");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Product 1", result.get(0).getName());
        verify(productRepository, times(1)).findByNameContaining("Product");
    }

    @Test
    void testSearchByName_NoResults() {
        // Arrange
        when(productRepository.findByNameContaining("Inexistente")).thenReturn(Collections.emptyList());

        // Act
        List<Product> result = productService.searchByName("Inexistente");

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(productRepository, times(1)).findByNameContaining("Inexistente");
    }

    @Test
    void testSearchByPrice() {
        // Arrange
        List<Product> products = Arrays.asList(product);
        when(productRepository.findByPriceBetween(50.0, 150.0)).thenReturn(products);

        // Act
        List<Product> result = productService.searchByPrice(50.0, 150.0);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Product 1", result.get(0).getName());
        verify(productRepository, times(1)).findByPriceBetween(50.0, 150.0);
    }

    @Test
    void testSearchByPrice_NoResults() {
        // Arrange
        when(productRepository.findByPriceBetween(200.0, 300.0)).thenReturn(Collections.emptyList());

        // Act
        List<Product> result = productService.searchByPrice(200.0, 300.0);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(productRepository, times(1)).findByPriceBetween(200.0, 300.0);
    }
}