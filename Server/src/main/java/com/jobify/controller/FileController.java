package com.jobify.controller;

import com.jobify.dto.ApiResponse;
import com.jobify.model.CompanyLogo;
import com.jobify.model.Resume;
import com.jobify.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * File Controller - Handles file upload/download operations
 * Base route: /api/v1/file
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/file")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    /**
     * Upload Resume
     * POST /api/v1/file/resume
     * Header: clerk-user-id
     * Body: multipart/form-data with "file" field
     */
    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Resume>> uploadResume(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        Resume resume = fileService.uploadResume(clerkUserId, file);
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded successfully", resume));
    }

    /**
     * Get Resume metadata
     * GET /api/v1/file/resume/{resumeId}
     */
    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<ApiResponse<Resume>> getResume(@PathVariable String resumeId) {
        Resume resume = fileService.getResume(resumeId);
        // Don't send file data in metadata response
        resume.setFileData(null);
        return ResponseEntity.ok(ApiResponse.success("Resume fetched successfully", resume));
    }

    /**
     * View/Download Resume file
     * GET /api/v1/file/resume/{resumeId}/view
     */
    @GetMapping("/resume/{resumeId}/view")
    public ResponseEntity<byte[]> viewResume(@PathVariable String resumeId) {
        Resume resume = fileService.getResume(resumeId);
        byte[] data = fileService.getResumeData(resumeId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(resume.getContentType()));
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resume.getFileName() + "\"");
        headers.setContentLength(data.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }

    /**
     * Download Resume file
     * GET /api/v1/file/resume/{resumeId}/download
     */
    @GetMapping("/resume/{resumeId}/download")
    public ResponseEntity<byte[]> downloadResume(@PathVariable String resumeId) {
        Resume resume = fileService.getResume(resumeId);
        byte[] data = fileService.getResumeData(resumeId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resume.getFileName() + "\"");
        headers.setContentLength(data.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }

    /**
     * Delete Resume
     * DELETE /api/v1/file/resume
     * Header: clerk-user-id
     */
    @DeleteMapping("/resume")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @RequestHeader("clerk-user-id") String clerkUserId) {
        
        fileService.deleteResume(clerkUserId);
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully"));
    }

    // ==================== COMPANY LOGO ENDPOINTS ====================

    /**
     * Upload Company Logo (creates or overwrites existing)
     * POST /api/v1/file/logo
     * Header: clerk-user-id
     * Body: multipart/form-data with "file" field
     */
    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CompanyLogo>> uploadLogo(
            @RequestHeader("clerk-user-id") String clerkUserId,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        CompanyLogo logo = fileService.uploadLogo(clerkUserId, file);
        return ResponseEntity.ok(ApiResponse.success("Logo uploaded successfully", logo));
    }

    /**
     * Get Logo metadata
     * GET /api/v1/file/logo/{logoId}
     */
    @GetMapping("/logo/{logoId}")
    public ResponseEntity<ApiResponse<CompanyLogo>> getLogo(@PathVariable String logoId) {
        CompanyLogo logo = fileService.getLogo(logoId);
        // Don't send file data in metadata response
        logo.setFileData(null);
        return ResponseEntity.ok(ApiResponse.success("Logo fetched successfully", logo));
    }

    /**
     * View Logo image
     * GET /api/v1/file/logo/{logoId}/view
     */
    @GetMapping("/logo/{logoId}/view")
    public ResponseEntity<byte[]> viewLogo(@PathVariable String logoId) {
        CompanyLogo logo = fileService.getLogo(logoId);
        byte[] data = fileService.getLogoData(logoId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(logo.getContentType()));
        headers.setCacheControl("public, max-age=86400"); // Cache for 24 hours
        headers.setContentLength(data.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }

    /**
     * Delete Company Logo
     * DELETE /api/v1/file/logo
     * Header: clerk-user-id
     */
    @DeleteMapping("/logo")
    public ResponseEntity<ApiResponse<Void>> deleteLogo(
            @RequestHeader("clerk-user-id") String clerkUserId) {
        
        fileService.deleteLogo(clerkUserId);
        return ResponseEntity.ok(ApiResponse.success("Logo deleted successfully"));
    }
}
