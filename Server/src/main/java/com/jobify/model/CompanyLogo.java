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
 * CompanyLogo Model - Stores uploaded company logo images
 * Collection: company_logo
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "company_logo")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanyLogo {

    @Id
    @JsonProperty("_id")
    private String id;

    // Clerk user ID of the recruiter who uploaded
    @Field("clerk_user_id")
    @JsonProperty("clerk_user_id")
    private String clerkUserId;

    // Original filename
    @Field("file_name")
    @JsonProperty("file_name")
    private String fileName;

    // File content type (e.g., "image/png", "image/jpeg")
    @Field("content_type")
    @JsonProperty("content_type")
    private String contentType;

    // File size in bytes
    @Field("file_size")
    @JsonProperty("file_size")
    private Long fileSize;

    // Base64 encoded image data
    @Field("file_data")
    @JsonProperty("file_data")
    private String fileData;

    // Timestamp when uploaded
    @Field("created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    // Timestamp when last updated
    @Field("updated_at")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
