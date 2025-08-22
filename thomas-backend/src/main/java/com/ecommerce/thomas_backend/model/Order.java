package com.ecommerce.thomas_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    private LocalDateTime date;
    @NotNull
    private Double total;
    @NotNull
    private Boolean isRandomOrder; // Nuevo campo para pedidos aleatorios
    @ManyToOne
    private User user;
}
