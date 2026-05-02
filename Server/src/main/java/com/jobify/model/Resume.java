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
 * Resume Model - Stores uploaded resume files
 * Collection: resumes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resume")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Resume {

    @Id
    @JsonProperty("_id")
    private String id;

    // Clerk user ID of the candidate who uploaded
    @Field("clerk_user_id")
    @JsonProperty("clerk_user_id")
    private String clerkUserId;

    // Original filename
    @Field("filename")
    @JsonProperty("filename")
    private String filename;

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
