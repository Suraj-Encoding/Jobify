package com.jobify.controller;

import com.jobify.dto.ApiResponse;
import com.jobify.dto.JobRequest;
import com.jobify.model.Job;
import com.jobify.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Job Controller - Handles job-related API endpoints
 * Base route: /api/v1/job
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/job")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    /**
     * Create Job - Create a new job posting (Recruiter only)
     * POST /api/v1/job
     * Header: clerk-user-id
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createJob(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @RequestBody JobRequest request) {
        
        String result = jobService.createJob(clerkUserId, request.getData());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Get All Jobs - Get all job listings (for candidates)
     * GET /api/v1/job/list
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Job>>> getAllJobs() {
        List<Job> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(ApiResponse.success("Jobs fetched successfully", jobs));
    }

    /**
     * Get My Jobs - Get jobs posted by the recruiter
     * GET /api/v1/job/my-jobs
     * Header: clerk-user-id
     */
    @GetMapping("/my-jobs")
    public ResponseEntity<ApiResponse<List<Job>>> getMyJobs(
            @RequestHeader("clerk-user-id") String clerkUserId) {
        
        List<Job> jobs = jobService.getJobsByRecruiter(clerkUserId);
        return ResponseEntity.ok(ApiResponse.success("Jobs fetched successfully", jobs));
    }

    /**
     * Get Job by ID - Get a specific job
     * GET /api/v1/job/{jobId}
     */
    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Job>> getJobById(@PathVariable String jobId) {
        Job job = jobService.getJobById(jobId);
        return ResponseEntity.ok(ApiResponse.success("Job fetched successfully", job));
    }

    /**
     * Update Job - Update an existing job posting (Recruiter only)
     * PUT /api/v1/job/{jobId}
     * Header: clerk-user-id
     */
    @PutMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Void>> updateJob(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @PathVariable String jobId,
            @RequestBody JobRequest request) {
        
        String result = jobService.updateJob(clerkUserId, jobId, request.getData());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Delete Job - Delete a job posting (Recruiter only)
     * DELETE /api/v1/job/{jobId}
     * Header: clerk-user-id
     */
    @DeleteMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @PathVariable String jobId) {
        
        String result = jobService.deleteJob(clerkUserId, jobId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
