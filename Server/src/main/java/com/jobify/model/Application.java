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
 * Application Model - Represents a job application
 * Collection: applications
 * 
 * Created when a candidate applies to a job
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "application")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Application {

    @Id
    @JsonProperty("_id")
    private String id;

    // Reference to the job being applied to
    @Field("job_id")
    @JsonProperty("job_id")
    private String jobId;

    // Reference to the candidate applying
    @Field("candidate_id")
    @JsonProperty("candidate_id")
    private String candidateId;

    // Clerk user ID of the candidate
    @Field("clerk_user_id")
    @JsonProperty("clerk_user_id")
    private String clerkUserId;

    // Application status: "PENDING", "REVIEWED", "ACCEPTED", "REJECTED"
    @Field("status")
    @JsonProperty("status")
    private String status;

    // Optional cover letter or note from candidate
    @Field("cover_letter")
    @JsonProperty("cover_letter")
    private String coverLetter;

    // Resume URL (uploaded file)
    @Field("resume_url")
    @JsonProperty("resume_url")
    private String resumeUrl;

    // Resume filename
    @Field("resume_filename")
    @JsonProperty("resume_filename")
    private String resumeFilename;

    // Rejection reason (if rejected)
    @Field("rejection_reason")
    @JsonProperty("rejection_reason")
    private String rejectionReason;

    // Candidate name (cached for easy access)
    @Field("candidate_name")
    @JsonProperty("candidate_name")
    private String candidateName;

    // Candidate email (cached for easy access)
    @Field("candidate_email")
    @JsonProperty("candidate_email")
    private String candidateEmail;

    // Timestamp when application was submitted
    @Field("created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    // Timestamp when application was last updated
    @Field("updated_at")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    // --- Populated fields (not stored in DB) ---

    // Job details (populated when fetching applications)
    @JsonProperty("job")
    private transient Job job;

    // Candidate details (populated when fetching applications)
    @JsonProperty("candidate")
    private transient User candidate;
}
