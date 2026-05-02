package com.jobify.controller;

import com.jobify.dto.ApiResponse;
import com.jobify.dto.ApplicationRequest;
import com.jobify.model.Application;
import com.jobify.model.Job;
import com.jobify.service.ApplicationService;
import com.jobify.service.ExcelService;
import com.jobify.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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
    private final ExcelService excelService;
    private final JobService jobService;

    @Value("${app.server.uri:http://localhost:3001}")
    private String serverBaseUrl;

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
     * Query: status (PENDING, UNDER_REVIEW, ACCEPTED, REJECTED)
     * Status flow: PENDING → UNDER_REVIEW → ACCEPTED/REJECTED (final states)
     */
    @PutMapping("/{applicationId}/status")
    public ResponseEntity<ApiResponse<Void>> updateApplicationStatus(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @PathVariable String applicationId,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        
        String result;
        if (reason != null && !reason.isEmpty()) {
            result = applicationService.updateApplicationStatusWithReason(clerkUserId, applicationId, status, reason);
        } else {
            result = applicationService.updateApplicationStatus(clerkUserId, applicationId, status);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Withdraw Application - Candidate withdraws their application
     * DELETE /api/v1/application/{applicationId}
     * Header: clerk-user-id
     */
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @PathVariable String applicationId) {
        
        String result = applicationService.withdrawApplication(clerkUserId, applicationId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Export Applications to Excel - Download candidates list as Excel file
     * GET /api/v1/application/job/{jobId}/export
     * Header: clerk-user-id
     */
    @GetMapping("/job/{jobId}/export")
    public ResponseEntity<byte[]> exportApplicationsToExcel(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @PathVariable String jobId) throws IOException {
        
        // Get job details
        Job job = jobService.getJobById(jobId);
        
        // Get applications
        List<Application> applications = applicationService.getApplicationsByJob(clerkUserId, jobId);
        
        // Generate Excel
        byte[] excelData = excelService.exportApplicationsToExcel(applications, job.getTitle(), serverBaseUrl);
        
        // Create filename
        String filename = "candidates_" + job.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + ".xlsx";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(excelData.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelData);
    }
}
