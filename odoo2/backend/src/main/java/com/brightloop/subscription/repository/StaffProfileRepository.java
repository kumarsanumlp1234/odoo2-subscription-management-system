package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffProfileRepository extends JpaRepository<StaffProfile, Long> {
    Optional<StaffProfile> findByUserId(Long userId);
    Optional<StaffProfile> findByEmployeeCode(String employeeCode);
}

