package com.jobify.repository;

import com.jobify.model.CoverLetter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * CoverLetter Repository - MongoDB operations for cover letters
 */
@Repository
public interface CoverLetterRepository extends MongoRepository<CoverLetter, String> {

    // Find cover letter by clerk user ID (for getting user's cover letters)
    Optional<CoverLetter> findByClerkUserId(String clerkUserId);

    // Check if cover letter exists for user
    boolean existsByClerkUserId(String clerkUserId);

    // Delete cover letter by ID
    void deleteById(String id);
}
