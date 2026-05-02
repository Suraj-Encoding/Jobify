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
 * CoverLetter Model - Stores uploaded cover letter files
 * Collection: cover_letter
 * 
 * Each application can have its own cover letter PDF
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cover_letter")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CoverLetter {

    @Id
    @JsonProperty("_id")
    private String id;

    // Clerk user ID of the candidate who uploaded
    @Field("clerk_user_id")
    @JsonProperty("clerk_user_id")
    private String clerkUserId;

    // Original filename
    @Field("file_name")
    @JsonProperty("file_name")
    private String fileName;

    // File content type (e.g., "application/pdf")
    @Field("content_type")
    @JsonProperty("content_type")
    private String contentType;

    // File size in bytes
    @Field("file_size")
    @JsonProperty("file_size")
    private Long fileSize;

    // Base64 encoded file data
    @Field("file_data")
    @JsonProperty("file_data")
    private String fileData;

    // Timestamp when uploaded
    @Field("created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
