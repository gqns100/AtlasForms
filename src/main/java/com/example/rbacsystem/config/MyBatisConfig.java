package com.example.rbacsystem.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan(basePackages = "com.example.rbacsystem.mapper")
public class MyBatisConfig {
}
