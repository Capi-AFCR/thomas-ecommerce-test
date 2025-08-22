package com.ecommerce.thomas_backend.repository;

import com.ecommerce.thomas_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT u, COUNT(o) FROM Order o JOIN o.user u GROUP BY u ORDER BY COUNT(o) DESC LIMIT 5")
    List<Object[]> findTop5Clients();

    long countByUserId(Long userId);

    //@Query("SELECT o FROM Order o JOIN User u ON u.id = uid")
    List<Order> findByUserId(Long uid);
}
