package com.jobify.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Application Request DTO
 * Used for applying to jobs
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {

    @JsonProperty("data")
    private ApplicationData data;

    /**
     * Application Data - Contains application information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationData {

        // Job ID to apply to (required)
        @JsonProperty("job_id")
        private String jobId;

        // Cover letter file ID (required - uploaded PDF)
        @JsonProperty("cover_letter_id")
        private String coverLetterId;

        // Resume ID (from uploaded resume)
        @JsonProperty("resume_id")
        private String resumeId;
    }
}
