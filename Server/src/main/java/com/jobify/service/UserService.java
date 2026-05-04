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

        // Update common fields (null = don't update, empty = clear, value = set)
        if (profileData.getPhone() != null) user.setPhone(getValueOrNull(profileData.getPhone()));
        if (profileData.getLocation() != null) user.setLocation(getValueOrNull(profileData.getLocation()));
        if (profileData.getLinkedinUrl() != null) user.setLinkedinUrl(getValueOrNull(profileData.getLinkedinUrl()));

        // Update candidate-specific fields
        if ("CANDIDATE".equals(user.getRole())) {
            if (profileData.getBio() != null) user.setBio(getValueOrNull(profileData.getBio()));
            if (profileData.getSkills() != null) user.setSkills(getValueOrNull(profileData.getSkills()));
            if (profileData.getExperienceLevel() != null) user.setExperienceLevel(getValueOrNull(profileData.getExperienceLevel()));
            if (profileData.getCurrentTitle() != null) user.setCurrentTitle(getValueOrNull(profileData.getCurrentTitle()));
            if (profileData.getEducationDegree() != null) user.setEducationDegree(getValueOrNull(profileData.getEducationDegree()));
            if (profileData.getEducationCollege() != null) user.setEducationCollege(getValueOrNull(profileData.getEducationCollege()));
            if (profileData.getPortfolioUrl() != null) user.setPortfolioUrl(getValueOrNull(profileData.getPortfolioUrl()));
            if (profileData.getExpectedSalary() != null) user.setExpectedSalary(getValueOrNull(profileData.getExpectedSalary()));
            if (profileData.getResumeId() != null) user.setResumeId(getValueOrNull(profileData.getResumeId()));
        }

        // Update recruiter/company-specific fields
        if ("RECRUITER".equals(user.getRole())) {
            if (profileData.getCompanyName() != null) user.setCompanyName(getValueOrNull(profileData.getCompanyName()));
            if (profileData.getCompanyLogo() != null) user.setCompanyLogo(getValueOrNull(profileData.getCompanyLogo()));
            if (profileData.getCompanyWebsite() != null) user.setCompanyWebsite(getValueOrNull(profileData.getCompanyWebsite()));
            if (profileData.getCompanyEmail() != null) user.setCompanyEmail(getValueOrNull(profileData.getCompanyEmail()));
            if (profileData.getCompanyPhone() != null) user.setCompanyPhone(getValueOrNull(profileData.getCompanyPhone()));
            if (profileData.getIndustry() != null) user.setIndustry(getValueOrNull(profileData.getIndustry()));
            if (profileData.getCompanySize() != null) user.setCompanySize(getValueOrNull(profileData.getCompanySize()));
            if (profileData.getHeadquarters() != null) user.setHeadquarters(getValueOrNull(profileData.getHeadquarters()));
            if (profileData.getCompanyDescription() != null) user.setCompanyDescription(getValueOrNull(profileData.getCompanyDescription()));
            if (profileData.getFoundedYear() != null) user.setFoundedYear(getValueOrNull(profileData.getFoundedYear()));
            if (profileData.getCompanyLinkedin() != null) user.setCompanyLinkedin(getValueOrNull(profileData.getCompanyLinkedin()));
        }

        user.setUpdatedAt(TimeUtils.getCurrentTimeInIST());
        userRepository.save(user);

        log.info("Profile updated successfully");
        return user;
    }

    /**
     * Helper method: returns trimmed value if not empty, otherwise null (to clear the field)
     */
    private String getValueOrNull(String str) {
        if (str == null || str.trim().isEmpty()) {
            return null;
        }
        return str.trim();
    }
}
