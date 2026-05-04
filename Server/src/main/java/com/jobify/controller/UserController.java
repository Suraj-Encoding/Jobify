package com.jobify.controller;

import com.jobify.dto.ApiResponse;
import com.jobify.dto.ClerkUserRequest;
import com.jobify.dto.RoleRequest;
import com.jobify.model.User;
import com.jobify.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * User Controller - Handles user-related API endpoints
 * Base route: /api/v1/user
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Clerk Webhook - Handle user events from Clerk
     * POST /api/v1/user/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Void>> handleClerkWebhook(@RequestBody ClerkUserRequest request) {
        log.info("Received Clerk webhook: {}", request.getType());

        ClerkUserRequest.ClerkUserData clerkUser = request.getData();

        if (clerkUser == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid webhook data"));
        }

        String result;
        switch (request.getType()) {
            case "user.created":
                result = userService.createUser(clerkUser);
                break;
            case "user.updated":
                result = userService.updateUserFromClerk(clerkUser);
                break;
            case "user.deleted":
                result = userService.deleteUser(clerkUser.getId());
                break;
            default:
                result = "Webhook type not handled: " + request.getType();
        }

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Set User Role - Set user as RECRUITER or CANDIDATE
     * PUT /api/v1/user/role
     * Header: clerk-user-id
     */
    @PutMapping("/role")
    public ResponseEntity<ApiResponse<Void>> setUserRole(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @RequestBody RoleRequest request) {
        
        String result = userService.updateUserRole(clerkUserId, request.getData().getRole());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Get Current User - Get the logged-in user's details
     * GET /api/v1/user
     * Header: clerk-user-id
     */
    @GetMapping
    public ResponseEntity<ApiResponse<User>> getCurrentUser(
            @RequestHeader("clerk-user-id") String clerkUserId) {
        
        User user = userService.getUser(clerkUserId);
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", user));
    }

    /**
     * Update Profile - Update user profile details
     * PUT /api/v1/user/profile
     * Header: clerk-user-id
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @RequestBody User profileData) {
        
        User updatedUser = userService.updateProfile(clerkUserId, profileData);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
    }
}
