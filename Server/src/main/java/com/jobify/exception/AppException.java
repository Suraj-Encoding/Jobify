package com.jobify.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * App Exception - Custom exception for application errors
 */
@Getter
public class AppException extends RuntimeException {

    private final HttpStatus status;

    public AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public AppException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }
}
