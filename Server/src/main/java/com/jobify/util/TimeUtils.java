package com.jobify.util;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Time Utilities - Helper methods for time operations
 */
public class TimeUtils {

    // India Standard Time zone
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    /**
     * Get current time in IST (India Standard Time)
     */
    public static LocalDateTime getCurrentTimeInIST() {
        return LocalDateTime.now(IST_ZONE);
    }
}
