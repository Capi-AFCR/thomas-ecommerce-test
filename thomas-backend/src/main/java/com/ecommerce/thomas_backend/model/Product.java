package com.ecommerce.thomas_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "products")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Product {
    @Id
    @GeneratedValue
    private Long id;
    @NotNull
    private String name;
    @NotNull
    private String description;
    @NotNull
    private Double price;
}
