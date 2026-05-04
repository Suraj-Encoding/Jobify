package com.jobify.service;

import com.jobify.dto.ClerkUserRequest;
import com.jobify.exception.AppException;
import com.jobify.model.User;
import com.jobify.repository.UserRepository;
import com.jobify.util.TimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * User Service - Business logic for user operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Create new user from Clerk webhook
     */
    public String createUser(ClerkUserRequest.ClerkUserData clerkUser) {
        log.info("Creating user with Clerk ID: {}", clerkUser.getId());

        // Check if user already exists
        if (userRepository.existsByClerkUserId(clerkUser.getId())) {
            log.warn("User already exists with Clerk ID: {}", clerkUser.getId());
            return "User already exists";
        }

        LocalDateTime now = TimeUtils.getCurrentTimeInIST();

        // Get email from Clerk data
        String email = clerkUser.getEmailAddresses() != null && 
                       !clerkUser.getEmailAddresses().isEmpty() ?
                       clerkUser.getEmailAddresses().get(0).getEmailAddress() : null;

        // Build user object
        User user = User.builder()
                .clerkUserId(clerkUser.getId().trim())
                .firstName(clerkUser.getFirstName())
                .lastName(clerkUser.getLastName())
                .email(email)
                .createdAt(now)
                .build();

        // Save user to database
        userRepository.save(user);
        log.info("User created successfully with ID: {}", user.getId());

        return "User created successfully!";
    }

    /**
     * Update user role (RECRUITER or CANDIDATE)
     */
    public String updateUserRole(String clerkUserId, String role) {
        log.info("Updating role for user: {} to {}", clerkUserId, role);

        // Validate role
        if (!role.equals("RECRUITER") && !role.equals("CANDIDATE")) {
            throw new AppException("Invalid role. Must be RECRUITER or CANDIDATE", HttpStatus.BAD_REQUEST);
        }

        // Find user
        User user = userRepository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Update role
        user.setRole(role);
        user.setUpdatedAt(TimeUtils.getCurrentTimeInIST());
        userRepository.save(user);

        log.info("User role updated successfully");
        return "User role updated successfully!";
    }

    /**
     * Get user by Clerk user ID
     */
    public User getUser(String clerkUserId) {
        return userRepository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Get user by ID
     */
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElse(null);
    }

    /**
     * Delete user from Clerk webhook
     */
    public String deleteUser(String clerkUserId) {
        log.info("Deleting user with Clerk ID: {}", clerkUserId);

        User user = userRepository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        userRepository.delete(user);
        log.info("User deleted successfully");

        return "User deleted successfully!";
    }

    /**
     * Update user from Clerk webhook (user.updated event)
     */
    public String updateUserFromClerk(ClerkUserRequest.ClerkUserData clerkUser) {
        log.info("Updating user from Clerk webhook, ID: {}", clerkUser.getId());

        User user = userRepository.findByClerkUserId(clerkUser.getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Update basic info from Clerk
        if (clerkUser.getFirstName() != null) user.setFirstName(clerkUser.getFirstName());
        if (clerkUser.getLastName() != null) user.setLastName(clerkUser.getLastName());

        // Update email if available
        if (clerkUser.getEmailAddresses() != null && !clerkUser.getEmailAddresses().isEmpty()) {
            user.setEmail(clerkUser.getEmailAddresses().get(0).getEmailAddress());
        }

        user.setUpdatedAt(TimeUtils.getCurrentTimeInIST());
        userRepository.save(user);

        log.info("User updated successfully from Clerk webhook");
        return "User updated successfully!";
    }

    /**
     * Update user profile
     */
    public User updateProfile(String clerkUserId, User profileData) {
        log.info("Updating profile for user: {}", clerkUserId);

        User user = userRepository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Update common fields (only if not empty)
        if (hasValue(profileData.getPhone())) user.setPhone(profileData.getPhone().trim());
        if (hasValue(profileData.getLocation())) user.setLocation(profileData.getLocation().trim());
        if (hasValue(profileData.getLinkedinUrl())) user.setLinkedinUrl(profileData.getLinkedinUrl().trim());

        // Update candidate-specific fields
        if ("CANDIDATE".equals(user.getRole())) {
            if (hasValue(profileData.getBio())) user.setBio(profileData.getBio().trim());
            if (hasValue(profileData.getSkills())) user.setSkills(profileData.getSkills().trim());
            if (hasValue(profileData.getExperienceLevel())) user.setExperienceLevel(profileData.getExperienceLevel().trim());
            if (hasValue(profileData.getCurrentTitle())) user.setCurrentTitle(profileData.getCurrentTitle().trim());
            if (hasValue(profileData.getEducationDegree())) user.setEducationDegree(profileData.getEducationDegree().trim());
            if (hasValue(profileData.getEducationCollege())) user.setEducationCollege(profileData.getEducationCollege().trim());
            if (hasValue(profileData.getPortfolioUrl())) user.setPortfolioUrl(profileData.getPortfolioUrl().trim());
            if (hasValue(profileData.getExpectedSalary())) user.setExpectedSalary(profileData.getExpectedSalary().trim());
            if (hasValue(profileData.getResumeId())) user.setResumeId(profileData.getResumeId().trim());
        }

        // Update recruiter/company-specific fields
        if ("RECRUITER".equals(user.getRole())) {
            if (hasValue(profileData.getCompanyName())) user.setCompanyName(profileData.getCompanyName().trim());
            if (hasValue(profileData.getCompanyLogo())) user.setCompanyLogo(profileData.getCompanyLogo().trim());
            if (hasValue(profileData.getCompanyWebsite())) user.setCompanyWebsite(profileData.getCompanyWebsite().trim());
            if (hasValue(profileData.getCompanyEmail())) user.setCompanyEmail(profileData.getCompanyEmail().trim());
            if (hasValue(profileData.getCompanyPhone())) user.setCompanyPhone(profileData.getCompanyPhone().trim());
            if (hasValue(profileData.getIndustry())) user.setIndustry(profileData.getIndustry().trim());
            if (hasValue(profileData.getCompanySize())) user.setCompanySize(profileData.getCompanySize().trim());
            if (hasValue(profileData.getHeadquarters())) user.setHeadquarters(profileData.getHeadquarters().trim());
            if (hasValue(profileData.getCompanyDescription())) user.setCompanyDescription(profileData.getCompanyDescription().trim());
            if (profileData.getFoundedYear() != null && profileData.getFoundedYear() > 0) user.setFoundedYear(profileData.getFoundedYear());
            if (hasValue(profileData.getCompanyLinkedin())) user.setCompanyLinkedin(profileData.getCompanyLinkedin().trim());
        }

        user.setUpdatedAt(TimeUtils.getCurrentTimeInIST());
        userRepository.save(user);

        log.info("Profile updated successfully");
        return user;
    }

    /**
     * Helper method to check if a string has actual value (not null and not empty)
     */
    private boolean hasValue(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
