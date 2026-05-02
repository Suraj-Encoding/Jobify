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
 * Job Model - Represents a job posting
 * Collection: jobs
 * 
 * Created by recruiters for candidates to apply
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "jobs")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Job {

    @Id
    @JsonProperty("_id")
    private String id;

    // Reference to the recruiter who posted this job
    @Field("recruiter_id")
    @JsonProperty("recruiter_id")
    private String recruiterId;

    // Clerk user ID of the recruiter
    @Field("clerk_user_id")
    @JsonProperty("clerk_user_id")
    private String clerkUserId;

    // Job title (e.g., "Software Engineer")
    @Field("title")
    @JsonProperty("title")
    private String title;

    // Job description
    @Field("description")
    @JsonProperty("description")
    private String description;

    // Job location (e.g., "Mumbai, India")
    @Field("location")
    @JsonProperty("location")
    private String location;

    // Salary (optional)
    @Field("salary")
    @JsonProperty("salary")
    private String salary;

    // Company name
    @Field("company")
    @JsonProperty("company")
    private String company;

    // Number of applications received
    @Field("application_count")
    @JsonProperty("application_count")
    private Integer applicationCount;

    // Timestamp when job was posted
    @Field("created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    // Timestamp when job was last updated
    @Field("updated_at")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
