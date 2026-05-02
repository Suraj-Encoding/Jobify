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
import java.nio.file.Files;
import java.nio.file.Path;

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
        // Load index.html from resources
        Resource resource = new ClassPathResource("public/html/index.html");
        String html = new String(Files.readAllBytes(resource.getFile().toPath()));
        return ResponseEntity.ok(html);
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

        byte[] content = Files.readAllBytes(Path.of(resource.getURI()));
        MediaType mediaType = MediaTypeFactory.getMediaType(filename).orElse(MediaType.APPLICATION_OCTET_STREAM);
        
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(content);
    }
}
