package com.jobify.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Role Request DTO
 * Used for setting user role after registration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequest {

    @JsonProperty("data")
    private RoleData data;

    /**
     * Role Data - Contains role information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleData {

        // User role: "RECRUITER" or "CANDIDATE"
        @JsonProperty("role")
        private String role;
    }
}
