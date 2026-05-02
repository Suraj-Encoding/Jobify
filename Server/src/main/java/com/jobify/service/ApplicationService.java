package com.jobify.service;

import com.jobify.dto.ApplicationRequest;
import com.jobify.exception.AppException;
import com.jobify.model.Application;
import com.jobify.model.Job;
import com.jobify.model.User;
import com.jobify.repository.ApplicationRepository;
import com.jobify.util.TimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Application Service - Business logic for job applications
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserService userService;
    private final JobService jobService;

    /**
     * Apply to a job
     * Only candidates can apply
     */
    public String applyToJob(String clerkUserId, ApplicationRequest.ApplicationData applicationData) {
        log.info("Candidate {} applying to job: {}", clerkUserId, applicationData.getJobId());

        // Get candidate
        User candidate = userService.getUser(clerkUserId);

        // Verify user is a candidate
        if (!"CANDIDATE".equals(candidate.getRole())) {
            throw new AppException("Only candidates can apply to jobs", HttpStatus.FORBIDDEN);
        }

        // Validate job ID
        if (applicationData.getJobId() == null || applicationData.getJobId().trim().isEmpty()) {
            throw new AppException("Job ID is required", HttpStatus.BAD_REQUEST);
        }

        // Check if job exists
        Job job = jobService.getJobById(applicationData.getJobId());

        // Check if job can accept more applications
        if (!jobService.canAcceptApplications(applicationData.getJobId())) {
            throw new AppException("This job has reached the maximum number of applications", HttpStatus.BAD_REQUEST);
        }

        // Check if already applied
        if (applicationRepository.existsByJobIdAndClerkUserId(applicationData.getJobId(), clerkUserId)) {
            throw new AppException("You have already applied to this job", HttpStatus.BAD_REQUEST);
        }

        LocalDateTime now = TimeUtils.getCurrentTimeInIST();

        // Build application object
        Application application = Application.builder()
                .jobId(applicationData.getJobId())
                .candidateId(candidate.getId())
                .clerkUserId(clerkUserId)
                .status("PENDING")
                .coverLetter(applicationData.getCoverLetter())
                .resumeUrl(applicationData.getResumeId())
                .candidateName(candidate.getFirstName() + " " + candidate.getLastName())
                .candidateEmail(candidate.getEmail())
                .createdAt(now)
                .build();

        // Save application
        applicationRepository.save(application);

        // Increment job application count
        jobService.incrementApplicationCount(applicationData.getJobId());

        log.info("Application submitted successfully with ID: {}", application.getId());

        return "Application submitted successfully!";
    }

    /**
     * Get applications for a job (for recruiter)
     */
    public List<Application> getApplicationsByJob(String clerkUserId, String jobId) {
        log.info("Fetching applications for job: {}", jobId);

        // Verify the job belongs to this recruiter
        Job job = jobService.getJobById(jobId);
        if (!job.getClerkUserId().equals(clerkUserId)) {
            throw new AppException("You can only view applications for your own jobs", HttpStatus.FORBIDDEN);
        }

        // Get applications
        List<Application> applications = applicationRepository.findByJobId(jobId);

        // Populate candidate details
        for (Application app : applications) {
            User candidate = userService.getUserById(app.getCandidateId());
            app.setCandidate(candidate);
            app.setJob(job);
        }

        return applications;
    }

    /**
     * Get applications by candidate (jobs they applied to)
     */
    public List<Application> getApplicationsByCandidate(String clerkUserId) {
        log.info("Fetching applications for candidate: {}", clerkUserId);

        // Get applications
        List<Application> applications = applicationRepository.findByClerkUserId(clerkUserId);

        // Populate job details
        for (Application app : applications) {
            try {
                Job job = jobService.getJobById(app.getJobId());
                app.setJob(job);
            } catch (Exception e) {
                // Job might have been deleted
                log.warn("Job not found for application: {}", app.getId());
            }
        }

        return applications;
    }

    /**
     * Update application status (for recruiter)
     */
    public String updateApplicationStatus(String clerkUserId, String applicationId, String status) {
        log.info("Updating application {} status to {}", applicationId, status);

        // Validate status
        if (!status.equals("PENDING") && !status.equals("REVIEWED") && 
            !status.equals("ACCEPTED") && !status.equals("REJECTED")) {
            throw new AppException("Invalid status", HttpStatus.BAD_REQUEST);
        }

        // Get application
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        // Verify the job belongs to this recruiter
        Job job = jobService.getJobById(application.getJobId());
        if (!job.getClerkUserId().equals(clerkUserId)) {
            throw new AppException("You can only update applications for your own jobs", HttpStatus.FORBIDDEN);
        }

        // Update status
        application.setStatus(status);
        application.setUpdatedAt(TimeUtils.getCurrentTimeInIST());
        applicationRepository.save(application);

        log.info("Application status updated successfully");

        return "Application status updated successfully!";
    }

    /**
     * Update application status with rejection reason (for recruiter)
     */
    public String updateApplicationStatusWithReason(String clerkUserId, String applicationId, String status, String rejectionReason) {
        log.info("Updating application {} status to {} with reason", applicationId, status);

        // Validate status
        if (!status.equals("PENDING") && !status.equals("REVIEWED") && 
            !status.equals("ACCEPTED") && !status.equals("REJECTED")) {
            throw new AppException("Invalid status", HttpStatus.BAD_REQUEST);
        }

        // Get application
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        // Verify the job belongs to this recruiter
        Job job = jobService.getJobById(application.getJobId());
        if (!job.getClerkUserId().equals(clerkUserId)) {
            throw new AppException("You can only update applications for your own jobs", HttpStatus.FORBIDDEN);
        }

        // Update status and rejection reason
        application.setStatus(status);
        if ("REJECTED".equals(status) && rejectionReason != null) {
            application.setRejectionReason(rejectionReason);
        }
        application.setUpdatedAt(TimeUtils.getCurrentTimeInIST());
        applicationRepository.save(application);

        log.info("Application status updated successfully");

        return "Application status updated successfully!";
    }

    /**
     * Get application by ID
     */
    public Application getApplicationById(String applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Withdraw application (Candidate only)
     * Only candidates can withdraw their own pending applications
     */
    public String withdrawApplication(String clerkUserId, String applicationId) {
        log.info("Candidate {} withdrawing application: {}", clerkUserId, applicationId);

        // Get application
        Application application = getApplicationById(applicationId);

        // Verify ownership
        if (!application.getClerkUserId().equals(clerkUserId)) {
            throw new AppException("You can only withdraw your own applications", HttpStatus.FORBIDDEN);
        }

        // Check if application can be withdrawn (only PENDING status)
        if (!"PENDING".equals(application.getStatus())) {
            throw new AppException("Only pending applications can be withdrawn", HttpStatus.BAD_REQUEST);
        }

        // Get job ID before deleting
        String jobId = application.getJobId();

        // Delete application
        applicationRepository.delete(application);

        // Decrement job application count
        try {
            jobService.decrementApplicationCount(jobId);
        } catch (Exception e) {
            log.warn("Could not decrement application count for job: {}", jobId);
        }

        log.info("Application withdrawn successfully");

        return "Application withdrawn successfully!";
    }
}
