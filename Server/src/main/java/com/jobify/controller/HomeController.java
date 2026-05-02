package com.jobify.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Home Controller - Serves the home page and static files
 * Route: /
 */
@RestController
public class HomeController {

    /**
     * Serve Home Page
     * GET /
     */
    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> home() throws IOException {
        // Load index.html from resources (works inside JAR)
        Resource resource = new ClassPathResource("public/html/index.html");
        try (InputStream inputStream = resource.getInputStream()) {
            String html = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            return ResponseEntity.ok(html);
        }
    }

    /**
     * Serve Images
     * GET /images/{filename}
     */
    @GetMapping("/images/{filename}")
    public ResponseEntity<byte[]> serveImage(@PathVariable String filename) throws IOException {
        Resource resource = new ClassPathResource("public/images/" + filename);
        
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        try (InputStream inputStream = resource.getInputStream()) {
            byte[] content = inputStream.readAllBytes();
            MediaType mediaType = MediaTypeFactory.getMediaType(filename).orElse(MediaType.APPLICATION_OCTET_STREAM);
            
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(content);
        }
    }

    /**
     * Serve Favicon
     * GET /favicon.ico
     */
    @GetMapping("/favicon.ico")
    public ResponseEntity<byte[]> serveFavicon() throws IOException {
        Resource resource = new ClassPathResource("public/images/logo.png");
        
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        try (InputStream inputStream = resource.getInputStream()) {
            byte[] content = inputStream.readAllBytes();
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(content);
        }
    }
}
