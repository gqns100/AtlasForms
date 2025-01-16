package com.example.rbacsystem.service;

import com.example.rbacsystem.model.Permission;
import com.example.rbacsystem.mapper.PermissionMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class PermissionService {
    private final PermissionMapper permissionMapper;

    public PermissionService(PermissionMapper permissionMapper) {
        this.permissionMapper = permissionMapper;
    }

    public Permission createPermission(Permission permission) {
        permissionMapper.save(permission);
        return permission;
    }

    public Permission getPermission(Long id) {
        return permissionMapper.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
    }

    public List<Permission> getAllPermissions() {
        return permissionMapper.findAll();
    }

    public Permission updatePermission(Long id, Permission permissionDetails) {
        Permission permission = getPermission(id);
        permission.setName(permissionDetails.getName());
        permission.setDescription(permissionDetails.getDescription());
        permissionMapper.update(permission);
        return permission;
    }

    public void deletePermission(Long id) {
        permissionMapper.deleteById(id);
    }
}
