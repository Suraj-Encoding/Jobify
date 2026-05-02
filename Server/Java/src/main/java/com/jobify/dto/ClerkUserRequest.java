package com.jobify.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Clerk User Request DTO
 * Handles user.created, user.updated, user.deleted events from Clerk webhook
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClerkUserRequest {

    @JsonProperty("type")
    private String type;

    @JsonProperty("data")
    private ClerkUserData data;

    /**
     * Clerk User Data - Contains user information from Clerk
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClerkUserData {

        @JsonProperty("id")
        private String id;

        @JsonProperty("first_name")
        private String firstName;

        @JsonProperty("last_name")
        private String lastName;

        @JsonProperty("email_addresses")
        private List<EmailAddress> emailAddresses;

        // For delete events
        @JsonProperty("deleted")
        private Boolean deleted;
    }

    /**
     * Email Address - Clerk email address object
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmailAddress {

        @JsonProperty("email_address")
        private String emailAddress;
    }
}
