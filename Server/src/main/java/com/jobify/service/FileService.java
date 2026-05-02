package com.jobify.service;

import com.jobify.exception.AppException;
import com.jobify.model.CompanyLogo;
import com.jobify.model.Resume;
import com.jobify.repository.CompanyLogoRepository;
import com.jobify.repository.ResumeRepository;
import com.jobify.util.TimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

/**
 * File Service - Business logic for file operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final ResumeRepository resumeRepository;
    private final CompanyLogoRepository companyLogoRepository;

    // Max file size: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    
    // Max logo size: 2MB
    private static final long MAX_LOGO_SIZE = 2 * 1024 * 1024;

    // Allowed content types for resume
    private static final String[] ALLOWED_RESUME_TYPES = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
    
    // Allowed content types for logo
    private static final String[] ALLOWED_IMAGE_TYPES = {
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp"
    };

    /**
     * Upload resume
     */
    public Resume uploadResume(String clerkUserId, MultipartFile file) throws IOException {
        log.info("Uploading resume for user: {}", clerkUserId);

        // Validate file
        validateFile(file);

        // Delete existing resume if any
        if (resumeRepository.existsByClerkUserId(clerkUserId)) {
            resumeRepository.deleteByClerkUserId(clerkUserId);
            log.info("Deleted existing resume for user: {}", clerkUserId);
        }

        // Convert file to base64
        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());

        // Create resume document
        Resume resume = Resume.builder()
                .clerkUserId(clerkUserId)
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .fileData(base64Data)
                .createdAt(TimeUtils.getCurrentTimeInIST())
                .build();

        resumeRepository.save(resume);
        log.info("Resume uploaded successfully: {}", resume.getId());

        // Clear file data from response (too large)
        resume.setFileData(null);
        return resume;
    }

    /**
     * Get resume by ID
     */
    public Resume getResume(String resumeId) {
        return resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Get resume by user ID
     */
    public Resume getResumeByUserId(String clerkUserId) {
        return resumeRepository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Get resume data (for viewing/downloading)
     */
    public byte[] getResumeData(String resumeId) {
        Resume resume = getResume(resumeId);
        return Base64.getDecoder().decode(resume.getFileData());
    }

    /**
     * Delete resume
     */
    public void deleteResume(String clerkUserId) {
        if (resumeRepository.existsByClerkUserId(clerkUserId)) {
            resumeRepository.deleteByClerkUserId(clerkUserId);
            log.info("Resume deleted for user: {}", clerkUserId);
        }
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new AppException("File is empty", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException("File size exceeds 5MB limit", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        boolean validType = false;
        for (String allowed : ALLOWED_RESUME_TYPES) {
            if (allowed.equals(contentType)) {
                validType = true;
                break;
            }
        }

        if (!validType) {
            throw new AppException("Invalid file type. Only PDF and Word documents are allowed", HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== COMPANY LOGO METHODS ====================

    /**
     * Upload company logo (overwrites existing)
     */
    public CompanyLogo uploadLogo(String clerkUserId, MultipartFile file) throws IOException {
        log.info("Uploading company logo for user: {}", clerkUserId);

        // Validate image file
        validateImageFile(file);

        // Convert file to base64
        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());

        // Check if logo already exists for this user
        CompanyLogo existingLogo = companyLogoRepository.findByClerkUserId(clerkUserId).orElse(null);

        if (existingLogo != null) {
            // Update existing logo
            existingLogo.setFileName(file.getOriginalFilename());
            existingLogo.setContentType(file.getContentType());
            existingLogo.setFileSize(file.getSize());
            existingLogo.setFileData(base64Data);
            existingLogo.setUpdatedAt(TimeUtils.getCurrentTimeInIST());
            companyLogoRepository.save(existingLogo);
            log.info("Company logo updated: {}", existingLogo.getId());
            existingLogo.setFileData(null);
            return existingLogo;
        } else {
            // Create new logo document
            CompanyLogo logo = CompanyLogo.builder()
                    .clerkUserId(clerkUserId)
                    .fileName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .fileData(base64Data)
                    .createdAt(TimeUtils.getCurrentTimeInIST())
                    .build();

            companyLogoRepository.save(logo);
            log.info("Company logo uploaded: {}", logo.getId());

            // Clear file data from response (too large)
            logo.setFileData(null);
            return logo;
        }
    }

    /**
     * Get company logo by ID
     */
    public CompanyLogo getLogo(String logoId) {
        return companyLogoRepository.findById(logoId)
                .orElseThrow(() -> new AppException("Logo not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Get company logo by user ID
     */
    public CompanyLogo getLogoByUserId(String clerkUserId) {
        return companyLogoRepository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new AppException("Logo not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Get logo data (for viewing)
     */
    public byte[] getLogoData(String logoId) {
        CompanyLogo logo = getLogo(logoId);
        return Base64.getDecoder().decode(logo.getFileData());
    }

    /**
     * Delete company logo
     */
    public void deleteLogo(String clerkUserId) {
        if (companyLogoRepository.existsByClerkUserId(clerkUserId)) {
            companyLogoRepository.deleteByClerkUserId(clerkUserId);
            log.info("Company logo deleted for user: {}", clerkUserId);
        }
    }

    /**
     * Validate uploaded image file
     */
    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new AppException("File is empty", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > MAX_LOGO_SIZE) {
            throw new AppException("Logo size exceeds 2MB limit", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        boolean validType = false;
        for (String allowed : ALLOWED_IMAGE_TYPES) {
            if (allowed.equals(contentType)) {
                validType = true;
                break;
            }
        }

        if (!validType) {
            throw new AppException("Invalid file type. Only PNG, JPEG, GIF, and WebP images are allowed", HttpStatus.BAD_REQUEST);
        }
    }
}
