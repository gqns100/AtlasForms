package com.example.rbacsystem.service;

import com.example.rbacsystem.model.Role;
import com.example.rbacsystem.model.Permission;
import com.example.rbacsystem.mapper.RoleMapper;
import com.example.rbacsystem.mapper.PermissionMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
@Transactional
public class RoleService {
    private final RoleMapper roleMapper;
    private final PermissionMapper permissionMapper;

    public RoleService(RoleMapper roleMapper, PermissionMapper permissionMapper) {
        this.roleMapper = roleMapper;
        this.permissionMapper = permissionMapper;
    }

    public Role createRole(Role role) {
        roleMapper.save(role);
        return role;
    }

    public Role getRole(Long id) {
        return roleMapper.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
    }

    public List<Role> getAllRoles() {
        return roleMapper.findAll();
    }

    public Role updateRole(Long id, Role roleDetails) {
        Role role = getRole(id);
        role.setName(roleDetails.getName());
        role.setDescription(roleDetails.getDescription());
        roleMapper.update(role);
        return role;
    }

    public void deleteRole(Long id) {
        roleMapper.deleteById(id);
    }

    public Role addPermissionToRole(Long roleId, Long permissionId) {
        Role role = getRole(roleId);
        Permission permission = permissionMapper.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        roleMapper.addRolePermission(roleId, permissionId);
        role.getPermissions().add(permission);
        return role;
    }

    public Role removePermissionFromRole(Long roleId, Long permissionId) {
        Role role = getRole(roleId);
        roleMapper.removeRolePermission(roleId, permissionId);
        role.getPermissions().removeIf(permission -> permission.getId().equals(permissionId));
        return role;
    }
}
