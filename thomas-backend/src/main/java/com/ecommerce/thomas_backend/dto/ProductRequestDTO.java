package com.ecommerce.thomas_backend.dto;

import lombok.Data;

@Data
public class ProductRequestDTO {
    private String name;
    private String description;
    private Double price;
    private Integer initialStock;
}