package com.ecommerce.thomas_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "inventory")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    @NotNull
    private Integer stock;
}
