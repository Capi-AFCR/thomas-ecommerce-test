package com.ecommerce.thomas_backend.controller;

import com.ecommerce.thomas_backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {
    @Autowired
    private ReportService service;

    @GetMapping("/active-products")
    public List<?> getActiveProducts() {
        return service.getActiveProducts();
    }

    @GetMapping("/top-sold")
    public List<Object[]> getTopSold() {
        return service.getTop5SoldProducts();
    }

    @GetMapping("/top-clients")
    public List<Object[]> getTopClients() {
        return service.getTop5Clients();
    }
}
