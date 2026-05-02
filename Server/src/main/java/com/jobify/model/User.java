package com.jobify.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * User Model - Represents a user in the system
 * Collection: users
 * 
 * Two types of users:
 * - RECRUITER: Can post jobs and view applicants (has company profile)
 * - CANDIDATE: Can view jobs and apply to them (has candidate profile)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {

    @Id
    @JsonProperty("_id")
    private String id;

    // Clerk user ID for authentication
    @Field("clerk_user_id")
    @JsonProperty("clerk_user_id")
    private String clerkUserId;

    // User's first name
    @Field("first_name")
    @JsonProperty("first_name")
    private String firstName;

    // User's last name
    @Field("last_name")
    @JsonProperty("last_name")
    private String lastName;

    // User's email address
    @Field("email")
    @JsonProperty("email")
    private String email;

    // User role: "RECRUITER" or "CANDIDATE"
    @Field("role")
    @JsonProperty("role")
    private String role;

    // ============ CANDIDATE PROFILE FIELDS ============
    
    // Phone number
    @Field("phone")
    @JsonProperty("phone")
    private String phone;

    // Location/City
    @Field("location")
    @JsonProperty("location")
    private String location;

    // Bio/About Me
    @Field("bio")
    @JsonProperty("bio")
    private String bio;

    // Skills (comma-separated)
    @Field("skills")
    @JsonProperty("skills")
    private String skills;

    // Experience Level
    @Field("experience_level")
    @JsonProperty("experience_level")
    private String experienceLevel;

    // Current/Last Job Title
    @Field("current_title")
    @JsonProperty("current_title")
    private String currentTitle;

    // Education - Degree
    @Field("education_degree")
    @JsonProperty("education_degree")
    private String educationDegree;

    // Education - College/University
    @Field("education_college")
    @JsonProperty("education_college")
    private String educationCollege;

    // LinkedIn URL
    @Field("linkedin_url")
    @JsonProperty("linkedin_url")
    private String linkedinUrl;

    // Portfolio URL
    @Field("portfolio_url")
    @JsonProperty("portfolio_url")
    private String portfolioUrl;

    // Expected Salary
    @Field("expected_salary")
    @JsonProperty("expected_salary")
    private String expectedSalary;

    // Resume ID (reference to Resume collection)
    @Field("resume_id")
    @JsonProperty("resume_id")
    private String resumeId;

    // ============ RECRUITER/COMPANY PROFILE FIELDS ============

    // Company Name
    @Field("company_name")
    @JsonProperty("company_name")
    private String companyName;

    // Company Logo URL
    @Field("company_logo")
    @JsonProperty("company_logo")
    private String companyLogo;

    // Company Website
    @Field("company_website")
    @JsonProperty("company_website")
    private String companyWebsite;

    // Company Email
    @Field("company_email")
    @JsonProperty("company_email")
    private String companyEmail;

    // Company Phone
    @Field("company_phone")
    @JsonProperty("company_phone")
    private String companyPhone;

    // Industry
    @Field("industry")
    @JsonProperty("industry")
    private String industry;

    // Company Size
    @Field("company_size")
    @JsonProperty("company_size")
    private String companySize;

    // Headquarters Location
    @Field("headquarters")
    @JsonProperty("headquarters")
    private String headquarters;

    // Company Description
    @Field("company_description")
    @JsonProperty("company_description")
    private String companyDescription;

    // Founded Year
    @Field("founded_year")
    @JsonProperty("founded_year")
    private Integer foundedYear;

    // Company LinkedIn URL
    @Field("company_linkedin")
    @JsonProperty("company_linkedin")
    private String companyLinkedin;

    // ============ METADATA ============

    // Profile completion percentage (calculated)
    @Transient
    @JsonProperty("profile_completion")
    private Integer profileCompletion;

    // Timestamp when user was created
    @Field("created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    // Timestamp when user was last updated
    @Field("updated_at")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    // Calculate profile completion percentage
    public Integer getProfileCompletion() {
        if ("CANDIDATE".equals(role)) {
            return calculateCandidateCompletion();
        } else if ("RECRUITER".equals(role)) {
            return calculateRecruiterCompletion();
        }
        return 0;
    }

    private Integer calculateCandidateCompletion() {
        int total = 10; // Total required fields
        int filled = 0;

        // Name (first + last) from Clerk = 10%
        if (firstName != null && !firstName.isEmpty()) filled++;
        // Email from Clerk = 10%
        if (email != null && !email.isEmpty()) filled++;
        // Profile fields = 80% (8 fields x 10% each)
        if (phone != null && !phone.isEmpty()) filled++;
        if (location != null && !location.isEmpty()) filled++;
        if (bio != null && !bio.isEmpty()) filled++;
        if (skills != null && !skills.isEmpty()) filled++;
        if (experienceLevel != null && !experienceLevel.isEmpty()) filled++;
        if (currentTitle != null && !currentTitle.isEmpty()) filled++;
        if (educationDegree != null && !educationDegree.isEmpty()) filled++;
        if (educationCollege != null && !educationCollege.isEmpty()) filled++;
        // Note: resume_id not included as it's uploaded per application

        return (filled * 100) / total;
    }

    private Integer calculateRecruiterCompletion() {
        int total = 10; // Total required fields
        int filled = 0;

        // Name (first + last) from Clerk = 10%
        if (firstName != null && !firstName.isEmpty()) filled++;
        // Email from Clerk = 10%
        if (email != null && !email.isEmpty()) filled++;
        // Company fields = 80% (8 fields x 10% each)
        if (companyName != null && !companyName.isEmpty()) filled++;
        if (companyWebsite != null && !companyWebsite.isEmpty()) filled++;
        if (companyEmail != null && !companyEmail.isEmpty()) filled++;
        if (companyPhone != null && !companyPhone.isEmpty()) filled++;
        if (industry != null && !industry.isEmpty()) filled++;
        if (companySize != null && !companySize.isEmpty()) filled++;
        if (headquarters != null && !headquarters.isEmpty()) filled++;
        if (companyDescription != null && !companyDescription.isEmpty()) filled++;
        // Note: company_logo and founded_year are optional

        return (filled * 100) / total;
    }
}
