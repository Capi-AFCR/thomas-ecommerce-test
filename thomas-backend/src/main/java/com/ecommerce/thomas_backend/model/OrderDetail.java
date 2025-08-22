package com.ecommerce.thomas_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "order_details")
@Data
@EntityListeners(AuditingEntityListener.class)
public class OrderDetail {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Order order;
    @ManyToOne
    private Product product;
    @NotNull
    private Integer quantity;
}
