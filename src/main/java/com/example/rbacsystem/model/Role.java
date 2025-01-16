package com.example.rbacsystem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    private Long id;

    @NotBlank
    private String name;

    private String description;

    private Set<Permission> permissions = new HashSet<>();
}
