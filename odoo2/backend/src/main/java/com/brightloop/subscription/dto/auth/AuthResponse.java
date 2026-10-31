package com.brightloop.subscription.dto.auth;

import java.util.Set;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String fullName;
    private String email;
    private Set<String> roles;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String fullName, String email, Set<String> roles) {
        this.token = token;
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}

