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
public class User {
    private Long id;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    private Set<Role> roles = new HashSet<>();

    private boolean enabled = true;
}
