package com.example.rbacsystem.mapper;

import com.example.rbacsystem.model.Role;
import com.example.rbacsystem.model.Permission;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Mapper
public interface RoleMapper {
    Optional<Role> findByName(String name);
    boolean existsByName(String name);
    void save(Role role);
    List<Role> findAll();
    void update(Role role);
    void deleteById(Long id);
    void addRolePermission(Long roleId, Long permissionId);
    void removeRolePermission(Long roleId, Long permissionId);
    Optional<Role> findById(Long id);
    Set<Permission> findPermissionsByRoleId(Long roleId);
}
