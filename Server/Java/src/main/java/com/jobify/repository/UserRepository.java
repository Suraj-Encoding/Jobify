package com.jobify.repository;

import com.jobify.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User Repository - Database operations for users
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Find user by Clerk user ID
     */
    Optional<User> findByClerkUserId(String clerkUserId);

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by Clerk user ID
     */
    boolean existsByClerkUserId(String clerkUserId);
}
