package com.jobify.controller;

import com.jobify.dto.ApiResponse;
import com.jobify.dto.ApplicationRequest;
import com.jobify.model.Application;
import com.jobify.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Application Controller - Handles job application API endpoints
 * Base route: /api/v1/application
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/application")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * Apply to Job - Submit an application (Candidate only)
     * POST /api/v1/application
     * Header: clerk-user-id
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> applyToJob(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @RequestBody ApplicationRequest request) {
        
        String result = applicationService.applyToJob(clerkUserId, request.getData());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Get Applications by Job - Get all applicants for a job (Recruiter only)
     * GET /api/v1/application/job/{jobId}
     * Header: clerk-user-id
     */
    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<Application>>> getApplicationsByJob(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @PathVariable String jobId) {
        
        List<Application> applications = applicationService.getApplicationsByJob(clerkUserId, jobId);
        return ResponseEntity.ok(ApiResponse.success("Applications fetched successfully", applications));
    }

    /**
     * Get My Applications - Get applications submitted by the candidate
     * GET /api/v1/application/my-applications
     * Header: clerk-user-id
     */
    @GetMapping("/my-applications")
    public ResponseEntity<ApiResponse<List<Application>>> getMyApplications(
            @RequestHeader("clerk-user-id") String clerkUserId) {
        
        List<Application> applications = applicationService.getApplicationsByCandidate(clerkUserId);
        return ResponseEntity.ok(ApiResponse.success("Applications fetched successfully", applications));
    }

    /**
     * Update Application Status - Update status of an application (Recruiter only)
     * PUT /api/v1/application/{applicationId}/status
     * Header: clerk-user-id
     * Query: status (PENDING, REVIEWED, ACCEPTED, REJECTED)
     */
    @PutMapping("/{applicationId}/status")
    public ResponseEntity<ApiResponse<Void>> updateApplicationStatus(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @PathVariable String applicationId,
            @RequestParam String status) {
        
        String result = applicationService.updateApplicationStatus(clerkUserId, applicationId, status);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
