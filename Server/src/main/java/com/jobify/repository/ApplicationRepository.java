package com.jobify.repository;

import com.jobify.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Application Repository - Database operations for job applications
 */
@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {

    /**
     * Find all applications for a job
     */
    List<Application> findByJobId(String jobId);

    /**
     * Find all applications by a candidate (by Clerk user ID)
     */
    List<Application> findByClerkUserId(String clerkUserId);

    /**
     * Check if candidate has already applied to a job
     */
    Optional<Application> findByJobIdAndClerkUserId(String jobId, String clerkUserId);

    /**
     * Check if application exists
     */
    boolean existsByJobIdAndClerkUserId(String jobId, String clerkUserId);
}
