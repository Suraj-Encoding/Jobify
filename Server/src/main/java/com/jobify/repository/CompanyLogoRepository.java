package com.jobify.repository;

import com.jobify.model.CompanyLogo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * CompanyLogo Repository - MongoDB operations for company logos
 */
@Repository
public interface CompanyLogoRepository extends MongoRepository<CompanyLogo, String> {

    // Find logo by clerk user ID
    Optional<CompanyLogo> findByClerkUserId(String clerkUserId);

    // Check if logo exists for user
    boolean existsByClerkUserId(String clerkUserId);

    // Delete logo by clerk user ID
    void deleteByClerkUserId(String clerkUserId);
}
