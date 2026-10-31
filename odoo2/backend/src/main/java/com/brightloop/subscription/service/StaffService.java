package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.staff.StaffRequest;
import com.brightloop.subscription.dto.staff.StaffResponse;
import com.brightloop.subscription.entity.Role;
import com.brightloop.subscription.entity.StaffProfile;
import com.brightloop.subscription.entity.User;
import com.brightloop.subscription.enums.RoleType;
import com.brightloop.subscription.exception.DuplicateResourceException;
import com.brightloop.subscription.exception.ResourceNotFoundException;
import com.brightloop.subscription.repository.RoleRepository;
import com.brightloop.subscription.repository.StaffProfileRepository;
import com.brightloop.subscription.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class StaffService {

    private final UserRepository userRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffService(
            UserRepository userRepository,
            StaffProfileRepository staffProfileRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<StaffResponse> getAllStaff(String search, Pageable pageable) {
        return userRepository.findByRoleNameAndSearch(RoleType.ROLE_STAFF, search, pageable)
                .map(this::mapToStaffResponse);
    }

    @Transactional(readOnly = true)
    public StaffResponse getStaffById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + id));
        return mapToStaffResponse(user);
    }

    @Transactional
    public StaffResponse createStaff(StaffRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account already exists with email: " + email);
        }

        Role staffRole = roleRepository.findByName(RoleType.ROLE_STAFF)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_STAFF, "Internal Staff Member")));

        String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank())
                ? request.getPassword() : "Staff@123";

        User user = new User(request.getFullName().trim(), email, passwordEncoder.encode(rawPassword));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRoles(Collections.singleton(staffRole));
        User savedUser = userRepository.save(user);

        StaffProfile profile = new StaffProfile(
                savedUser,
                request.getDepartment(),
                request.getDesignation(),
                request.getEmployeeCode() != null ? request.getEmployeeCode() : "EMP-" + savedUser.getId()
        );
        staffProfileRepository.save(profile);

        return mapToStaffResponse(savedUser);
    }

    @Transactional
    public StaffResponse updateStaff(Long id, StaffRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + id));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());

        StaffProfile profile = staffProfileRepository.findByUserId(id)
                .orElseGet(() -> new StaffProfile(user, request.getDepartment(), request.getDesignation(), request.getEmployeeCode()));

        profile.setDepartment(request.getDepartment());
        profile.setDesignation(request.getDesignation());
        if (request.getEmployeeCode() != null) {
            profile.setEmployeeCode(request.getEmployeeCode());
        }
        staffProfileRepository.save(profile);

        return mapToStaffResponse(user);
    }

    @Transactional
    public void updateStaffStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + id));
        user.setActive(active);
        userRepository.save(user);
    }

    public StaffResponse mapToStaffResponse(User user) {
        StaffResponse res = new StaffResponse();
        res.setId(user.getId());
        res.setUserId(user.getId());
        res.setFullName(user.getFullName());
        res.setEmail(user.getEmail());
        res.setPhoneNumber(user.getPhoneNumber());
        res.setActive(user.getActive());
        res.setCreatedAt(user.getCreatedAt());

        StaffProfile profile = user.getStaffProfile();
        if (profile == null) {
            profile = staffProfileRepository.findByUserId(user.getId()).orElse(null);
        }

        if (profile != null) {
            res.setDepartment(profile.getDepartment());
            res.setDesignation(profile.getDesignation());
            res.setEmployeeCode(profile.getEmployeeCode());
        }

        return res;
    }
}

