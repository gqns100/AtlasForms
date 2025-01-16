package com.example.rbacsystem.mapper;

import com.example.rbacsystem.model.Permission;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Optional;

@Mapper
public interface PermissionMapper {
    Optional<Permission> findByName(String name);
    boolean existsByName(String name);
    void save(Permission permission);
    List<Permission> findAll();
    void update(Permission permission);
    void deleteById(Long id);
    Optional<Permission> findById(Long id);
}
