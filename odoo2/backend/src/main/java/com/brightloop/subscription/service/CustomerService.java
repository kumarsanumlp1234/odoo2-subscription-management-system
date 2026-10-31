package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.customer.CustomerRequest;
import com.brightloop.subscription.dto.customer.CustomerResponse;
import com.brightloop.subscription.entity.CustomerProfile;
import com.brightloop.subscription.entity.Role;
import com.brightloop.subscription.entity.User;
import com.brightloop.subscription.enums.RoleType;
import com.brightloop.subscription.exception.DuplicateResourceException;
import com.brightloop.subscription.exception.ResourceNotFoundException;
import com.brightloop.subscription.repository.CustomerProfileRepository;
import com.brightloop.subscription.repository.RoleRepository;
import com.brightloop.subscription.repository.SubscriptionRepository;
import com.brightloop.subscription.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class CustomerService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final RoleRepository roleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(
            UserRepository userRepository,
            CustomerProfileRepository customerProfileRepository,
            RoleRepository roleRepository,
            SubscriptionRepository subscriptionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.roleRepository = roleRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(String search, Pageable pageable) {
        return userRepository.findByRoleNameAndSearch(RoleType.ROLE_CUSTOMER, search, pageable)
                .map(this::mapToCustomerResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToCustomerResponse(user);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User already exists with email: " + email);
        }

        Role customerRole = roleRepository.findByName(RoleType.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_CUSTOMER, "Customer Portal Access")));

        String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank())
                ? request.getPassword() : "Customer@123";

        User user = new User(request.getFullName().trim(), email, passwordEncoder.encode(rawPassword));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRoles(Collections.singleton(customerRole));
        User savedUser = userRepository.save(user);

        CustomerProfile profile = new CustomerProfile(savedUser, request.getCompanyName());
        profile.setGstNumber(request.getGstNumber());
        profile.setBillingAddressLine1(request.getBillingAddressLine1());
        profile.setBillingAddressLine2(request.getBillingAddressLine2());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setPostalCode(request.getPostalCode());
        profile.setCountry(request.getCountry() != null ? request.getCountry() : "India");
        profile.setPaymentTerms(request.getPaymentTerms() != null ? request.getPaymentTerms() : "Immediate");
        profile.setNotes(request.getNotes());
        customerProfileRepository.save(profile);

        return mapToCustomerResponse(savedUser);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());

        CustomerProfile profile = customerProfileRepository.findByUserId(id)
                .orElseGet(() -> new CustomerProfile(user, request.getCompanyName()));

        profile.setCompanyName(request.getCompanyName());
        profile.setGstNumber(request.getGstNumber());
        profile.setBillingAddressLine1(request.getBillingAddressLine1());
        profile.setBillingAddressLine2(request.getBillingAddressLine2());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setPostalCode(request.getPostalCode());
        profile.setCountry(request.getCountry());
        profile.setPaymentTerms(request.getPaymentTerms());
        profile.setNotes(request.getNotes());
        customerProfileRepository.save(profile);

        return mapToCustomerResponse(user);
    }

    public CustomerResponse mapToCustomerResponse(User user) {
        CustomerResponse res = new CustomerResponse();
        res.setId(user.getId());
        res.setUserId(user.getId());
        res.setFullName(user.getFullName());
        res.setEmail(user.getEmail());
        res.setPhoneNumber(user.getPhoneNumber());
        res.setActive(user.getActive());
        res.setCreatedAt(user.getCreatedAt());

        CustomerProfile profile = user.getCustomerProfile();
        if (profile == null) {
            profile = customerProfileRepository.findByUserId(user.getId()).orElse(null);
        }

        if (profile != null) {
            res.setCompanyName(profile.getCompanyName());
            res.setGstNumber(profile.getGstNumber());
            res.setBillingAddressLine1(profile.getBillingAddressLine1());
            res.setBillingAddressLine2(profile.getBillingAddressLine2());
            res.setCity(profile.getCity());
            res.setState(profile.getState());
            res.setPostalCode(profile.getPostalCode());
            res.setCountry(profile.getCountry());
            res.setPaymentTerms(profile.getPaymentTerms());
            res.setNotes(profile.getNotes());
        }

        res.setSubscriptionCount(subscriptionRepository.countByCustomerId(user.getId()));
        return res;
    }
}

