package com.brightloop.subscription.config;

import com.brightloop.subscription.security.CustomAccessDeniedHandler;
import com.brightloop.subscription.security.CustomUserDetailsService;
import com.brightloop.subscription.security.JwtAuthenticationFilter;
import com.brightloop.subscription.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            CustomAccessDeniedHandler accessDeniedHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource) {
        this.userDetailsService = userDetailsService;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow all CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public auth endpoints
                .requestMatchers("/api/auth/**").permitAll()
                // Admin-only staff management
                .requestMatchers("/api/admin/staff/**").hasRole("ADMIN")
                // Tax & Discount administrative configuration
                .requestMatchers(HttpMethod.POST, "/api/taxes/**", "/api/discounts/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/taxes/**", "/api/discounts/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/taxes/**", "/api/discounts/**").hasRole("ADMIN")
                // Product & Plan mutations
                .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/plans/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/plans/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/plans/**").hasRole("ADMIN")
                // Staff & Admin endpoints
                .requestMatchers("/api/customers/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers("/api/quotations/**").hasAnyRole("ADMIN", "STAFF")
                // Dashboard
                .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "STAFF")
                // All other API endpoints authenticated
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

