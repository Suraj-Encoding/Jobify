package com.jobify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Jobify Application - Main Entry Point
 * A simple job portal with Recruiter and Candidate roles
 */
@SpringBootApplication
public class JobifyApplication {

    public static void main(String[] args) {
        // Print welcome banner
        System.out.println("#----------| 🚀 Welcome to Jobify 🚀 |----------#");
        
        // Start the Spring Boot application
        SpringApplication.run(JobifyApplication.class, args);
        
        // Print server running message
        System.out.println("🕸️  Server Connected!");
        System.out.println("🕸️  Database Connected!");
        System.out.println("🚀 Server is running...");
    }
}
