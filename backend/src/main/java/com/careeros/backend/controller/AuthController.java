package com.careeros.backend.controller;

import com.careeros.backend.model.Role;
import com.careeros.backend.model.User;
import com.careeros.backend.payload.request.LoginRequest;
import com.careeros.backend.payload.request.SignupRequest;
import com.careeros.backend.payload.response.JwtResponse;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.repository.UserRepository;
import com.careeros.backend.security.JwtUtils;
import com.careeros.backend.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        System.out.println("Generated JWT: " + jwt);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = Role.ROLE_USER;
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = Role.ROLE_ADMIN;
                        roles.add(adminRole);
                        break;
                    case "candidate":
                        Role candidateRole = Role.ROLE_CANDIDATE;
                        roles.add(candidateRole);
                        break;
                    case "recruiter":
                        Role recruiterRole = Role.ROLE_RECRUITER;
                        roles.add(recruiterRole);
                        break;
                    default:
                        Role userRole = Role.ROLE_USER;
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // In a stateless JWT setup, logout is handled client-side
        // by removing the token. This endpoint can be used for logging
        // logout events or future server-side token blacklisting.
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        // This endpoint validates the JWT token
        // If the request reaches here, the token is valid
        return ResponseEntity.ok(new MessageResponse("Token is valid"));
    }
} 