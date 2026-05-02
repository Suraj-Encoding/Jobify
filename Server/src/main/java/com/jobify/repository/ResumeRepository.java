package com.jobify.repository;

import com.jobify.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Resume Repository - MongoDB operations for resumes
 */
@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {

    // Find resume by clerk user ID
    Optional<Resume> findByClerkUserId(String clerkUserId);

    // Check if resume exists for user
    boolean existsByClerkUserId(String clerkUserId);

    // Delete resume by clerk user ID
    void deleteByClerkUserId(String clerkUserId);
}
