package com.jobify.service;

import com.jobify.dto.JobRequest;
import com.jobify.exception.AppException;
import com.jobify.model.Job;
import com.jobify.model.User;
import com.jobify.repository.JobRepository;
import com.jobify.util.TimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Job Service - Business logic for job operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserService userService;

    /**
     * Create a new job posting
     * Only recruiters can create jobs
     */
    public String createJob(String clerkUserId, JobRequest.JobData jobData) {
        log.info("Creating job for recruiter: {}", clerkUserId);

        // Get recruiter
        User recruiter = userService.getUser(clerkUserId);

        // Verify user is a recruiter
        if (!"RECRUITER".equals(recruiter.getRole())) {
            throw new AppException("Only recruiters can create jobs", HttpStatus.FORBIDDEN);
        }

        // Validate required fields
        if (jobData.getTitle() == null || jobData.getTitle().trim().isEmpty()) {
            throw new AppException("Job title is required", HttpStatus.BAD_REQUEST);
        }
        if (jobData.getDescription() == null || jobData.getDescription().trim().isEmpty()) {
            throw new AppException("Job description is required", HttpStatus.BAD_REQUEST);
        }
        if (jobData.getLocation() == null || jobData.getLocation().trim().isEmpty()) {
            throw new AppException("Job location is required", HttpStatus.BAD_REQUEST);
        }
        if (jobData.getCompany() == null || jobData.getCompany().trim().isEmpty()) {
            throw new AppException("Company name is required", HttpStatus.BAD_REQUEST);
        }

        LocalDateTime now = TimeUtils.getCurrentTimeInIST();

        // Build job object
        Job job = Job.builder()
                .recruiterId(recruiter.getId())
                .clerkUserId(clerkUserId)
                .title(jobData.getTitle().trim())
                .description(jobData.getDescription().trim())
                .location(jobData.getLocation().trim())
                .salary(jobData.getSalary() != null ? jobData.getSalary().trim() : null)
                .company(jobData.getCompany().trim())
                .type(jobData.getType() != null ? jobData.getType().trim() : "FULL_TIME")
                .experience(jobData.getExperience() != null ? jobData.getExperience().trim() : null)
                .skills(jobData.getSkills() != null ? jobData.getSkills().trim() : null)
                .requirements(jobData.getRequirements() != null ? jobData.getRequirements().trim() : null)
                .benefits(jobData.getBenefits() != null ? jobData.getBenefits().trim() : null)
                .deadline(jobData.getDeadline() != null ? jobData.getDeadline().trim() : null)
                .maxApplications(jobData.getMaxApplications())
                .applicationCount(0)
                .createdAt(now)
                .build();

        // Save job to database
        jobRepository.save(job);
        log.info("Job created successfully with ID: {}", job.getId());

        return "Job created successfully!";
    }

    /**
     * Get all jobs (for candidates to browse)
     */
    public List<Job> getAllJobs() {
        log.info("Fetching all jobs");
        return jobRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get jobs posted by a recruiter
     */
    public List<Job> getJobsByRecruiter(String clerkUserId) {
        log.info("Fetching jobs for recruiter: {}", clerkUserId);
        return jobRepository.findByClerkUserId(clerkUserId);
    }

    /**
     * Get job by ID
     */
    public Job getJobById(String jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Update application count for a job
     */
    public void incrementApplicationCount(String jobId) {
        Job job = getJobById(jobId);
        int currentCount = job.getApplicationCount() != null ? job.getApplicationCount() : 0;
        job.setApplicationCount(currentCount + 1);
        job.setUpdatedAt(TimeUtils.getCurrentTimeInIST());
        jobRepository.save(job);
    }

    /**
     * Decrement application count for a job (when application is withdrawn)
     */
    public void decrementApplicationCount(String jobId) {
        Job job = getJobById(jobId);
        int currentCount = job.getApplicationCount() != null ? job.getApplicationCount() : 0;
        if (currentCount > 0) {
            job.setApplicationCount(currentCount - 1);
            job.setUpdatedAt(TimeUtils.getCurrentTimeInIST());
            jobRepository.save(job);
        }
    }

    /**
     * Check if job can accept more applications
     */
    public boolean canAcceptApplications(String jobId) {
        Job job = getJobById(jobId);
        if (job.getMaxApplications() == null) {
            return true; // No limit
        }
        int currentCount = job.getApplicationCount() != null ? job.getApplicationCount() : 0;
        return currentCount < job.getMaxApplications();
    }

    /**
     * Delete a job
     * Only the recruiter who posted it can delete
     */
    public String deleteJob(String clerkUserId, String jobId) {
        log.info("Deleting job: {} by recruiter: {}", jobId, clerkUserId);

        Job job = getJobById(jobId);

        // Verify ownership
        if (!job.getClerkUserId().equals(clerkUserId)) {
            throw new AppException("You can only delete your own jobs", HttpStatus.FORBIDDEN);
        }

        jobRepository.delete(job);
        log.info("Job deleted successfully");

        return "Job deleted successfully!";
    }
}
