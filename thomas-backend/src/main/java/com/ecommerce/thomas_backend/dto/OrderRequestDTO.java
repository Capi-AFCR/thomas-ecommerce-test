package com.ecommerce.thomas_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDTO {
    private List<ProductQuantity> products;
    private Boolean isRandomOrder;

    @Data
    public static class ProductQuantity {
        private Long productId;
        private Integer quantity;
    }
}
