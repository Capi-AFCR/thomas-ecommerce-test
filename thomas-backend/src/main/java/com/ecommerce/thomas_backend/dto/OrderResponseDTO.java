package com.ecommerce.thomas_backend.dto;

import com.ecommerce.thomas_backend.model.Order;
import com.ecommerce.thomas_backend.model.OrderDetail;

import java.util.List;

public class OrderResponseDTO {
    public Order order;
    public List<OrderDetail> orderDetail;
}
