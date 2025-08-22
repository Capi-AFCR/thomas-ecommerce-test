package com.ecommerce.thomas_backend.repository;

import com.ecommerce.thomas_backend.model.OrderDetail;
import com.ecommerce.thomas_backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    @Query("SELECT p, SUM(o.quantity) FROM OrderDetail o JOIN Product p ON p.id = o.product.id GROUP BY p ORDER BY 2 DESC LIMIT 5")
    List<Object[]> findTop5SoldProducts();

    List<OrderDetail> findByOrderId(Long id);
}