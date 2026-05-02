package com.jobify.repository;

import com.jobify.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Job Repository - Database operations for jobs
 */
@Repository
public interface JobRepository extends MongoRepository<Job, String> {

    /**
     * Find all jobs posted by a recruiter (by Clerk user ID)
     */
    List<Job> findByClerkUserId(String clerkUserId);

    /**
     * Find all jobs ordered by creation date (newest first)
     */
    List<Job> findAllByOrderByCreatedAtDesc();
}
