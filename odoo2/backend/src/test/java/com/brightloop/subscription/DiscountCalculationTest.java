package com.brightloop.subscription;

import com.brightloop.subscription.entity.Discount;
import com.brightloop.subscription.enums.DiscountType;
import com.brightloop.subscription.service.DiscountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class DiscountCalculationTest {

    @Autowired
    private DiscountService discountService;

    @Test
    void testExpiredDiscountReturnsZero() {
        Discount discount = new Discount("EXPIRED_SALE", DiscountType.PERCENTAGE, new BigDecimal("20.00"));
        discount.setStartDate(LocalDate.now().minusMonths(2));
        discount.setEndDate(LocalDate.now().minusDays(1)); // Expired yesterday
        discount.setMaximumUsage(100);
        discount.setUsageCount(0);

        BigDecimal discountAmount = discountService.calculateDiscountAmount(discount, new BigDecimal("1000.00"), 1, LocalDate.now());
        assertEquals(BigDecimal.ZERO, discountAmount, "Expired discount must return 0 discount amount.");
    }

    @Test
    void testMaxUsageReachedReturnsZero() {
        Discount discount = new Discount("LIMITED50", DiscountType.FIXED_AMOUNT, new BigDecimal("200.00"));
        discount.setMaximumUsage(5);
        discount.setUsageCount(5); // Maximum reached
        discount.setStartDate(LocalDate.now().minusDays(5));
        discount.setEndDate(LocalDate.now().plusDays(5));

        BigDecimal discountAmount = discountService.calculateDiscountAmount(discount, new BigDecimal("1000.00"), 1, LocalDate.now());
        assertEquals(BigDecimal.ZERO, discountAmount, "Discount that reached max usage limit must not apply.");
    }

    @Test
    void testDiscountCalculationPercentageAndCap() {
        Discount discount = new Discount("HALF_OFF", DiscountType.PERCENTAGE, new BigDecimal("50.00"));
        discount.setStartDate(LocalDate.now().minusDays(5));
        discount.setEndDate(LocalDate.now().plusDays(5));

        BigDecimal discountAmount = discountService.calculateDiscountAmount(discount, new BigDecimal("1000.00"), 1, LocalDate.now());
        assertEquals(new BigDecimal("500.00"), discountAmount);
    }
}

