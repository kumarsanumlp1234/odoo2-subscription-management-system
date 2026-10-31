package com.brightloop.subscription.controller;

import com.brightloop.subscription.dto.common.ApiResponse;
import com.brightloop.subscription.dto.staff.StaffRequest;
import com.brightloop.subscription.dto.staff.StaffResponse;
import com.brightloop.subscription.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/staff")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStaffController {

    private final StaffService staffService;

    public AdminStaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<StaffResponse>>> getAllStaff(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<StaffResponse> page = staffService.getAllStaff(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> getStaffById(@PathVariable Long id) {
        StaffResponse response = staffService.getStaffById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(@Valid @RequestBody StaffRequest request) {
        StaffResponse response = staffService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Staff account created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffRequest request) {
        StaffResponse response = staffService.updateStaff(id, request);
        return ResponseEntity.ok(ApiResponse.success("Staff account updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStaffStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("active", true);
        staffService.updateStaffStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Staff status updated successfully", null));
    }
}

