package com.jobify.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * User Model - Represents a user in the system
 * Collection: users
 * 
 * Two types of users:
 * - RECRUITER: Can post jobs and view applicants
 * - CANDIDATE: Can view jobs and apply to them
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
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

    // Timestamp when user was created
    @Field("created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    // Timestamp when user was last updated
    @Field("updated_at")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
