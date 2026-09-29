package com.wagetrack.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Getter
@Setter
public class AppProperties {

    @Value("${wagetrack.standard-workday-hours:8.0}")
    private BigDecimal standardWorkdayHours;

    @Value("${wagetrack.overtime-multiplier:1.5}")
    private BigDecimal overtimeMultiplier;

    @Value("${wagetrack.seed-data:false}")
    private boolean seedData;
}
