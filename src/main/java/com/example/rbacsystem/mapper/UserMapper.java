package com.example.rbacsystem.mapper;

import com.example.rbacsystem.model.User;
import com.example.rbacsystem.model.Role;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Mapper
public interface UserMapper {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    void save(User user);
    List<User> findAll();
    void update(User user);
    void deleteById(Long id);
    void addUserRole(Long userId, Long roleId);
    void removeUserRole(Long userId, Long roleId);
    Optional<User> findById(Long id);
    Set<Role> findRolesByUserId(Long userId);
}
