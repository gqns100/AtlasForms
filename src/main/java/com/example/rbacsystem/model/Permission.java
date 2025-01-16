package com.example.rbacsystem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    private Long id;

    @NotBlank
    private String name;

    private String description;
}
