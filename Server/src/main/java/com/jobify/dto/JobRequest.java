package com.jobify.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Job Request DTO
 * Used for creating and updating jobs
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @JsonProperty("data")
    private JobData data;

    /**
     * Job Data - Contains job information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobData {

        // Job title (required)
        @JsonProperty("title")
        private String title;

        // Job description (required)
        @JsonProperty("description")
        private String description;

        // Job location (required)
        @JsonProperty("location")
        private String location;

        // Salary (optional)
        @JsonProperty("salary")
        private String salary;

        // Company name (required)
        @JsonProperty("company")
        private String company;

        // Job type: FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT, REMOTE
        @JsonProperty("type")
        private String type;

        // Experience required
        @JsonProperty("experience")
        private String experience;

        // Required skills
        @JsonProperty("skills")
        private String skills;

        // Detailed requirements
        @JsonProperty("requirements")
        private String requirements;

        // Benefits offered
        @JsonProperty("benefits")
        private String benefits;

        // Application deadline
        @JsonProperty("deadline")
        private String deadline;
    }
}
