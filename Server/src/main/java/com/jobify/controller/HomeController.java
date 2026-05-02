package com.jobify.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;

/**
 * Home Controller - Serves the home page
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
        // Load index.html from resources
        Resource resource = new ClassPathResource("public/html/index.html");
        String html = new String(Files.readAllBytes(resource.getFile().toPath()));
        return ResponseEntity.ok(html);
    }
}
