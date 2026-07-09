package com.patternforge.service;

import com.patternforge.model.Settings;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Computes the user's effective "study day" based on their configured daily reset time.
 * A day runs from resetTime on date D until resetTime on date D+1.
 */
@Service
public class DailyBoundaryService {

    public LocalTime getResetTime(Settings settings) {
        int hour = (settings != null && settings.getDailyResetHour() != null) ? settings.getDailyResetHour() : 2;
        int minute = (settings != null && settings.getDailyResetMinute() != null) ? settings.getDailyResetMinute() : 0;
        return LocalTime.of(hour, minute);
    }

    public LocalDate getCurrentEffectiveDate(Settings settings) {
        LocalTime resetTime = getResetTime(settings);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayReset = LocalDateTime.of(LocalDate.now(), resetTime);
        if (now.isBefore(todayReset)) {
            return LocalDate.now().minusDays(1);
        }
        return LocalDate.now();
    }

    public LocalDate getEffectiveDateForTimestamp(LocalDateTime timestamp, Settings settings) {
        if (timestamp == null) return null;
        LocalTime resetTime = getResetTime(settings);
        LocalDateTime resetOnDay = LocalDateTime.of(timestamp.toLocalDate(), resetTime);
        if (timestamp.isBefore(resetOnDay)) {
            return timestamp.toLocalDate().minusDays(1);
        }
        return timestamp.toLocalDate();
    }

    public boolean isOnCurrentEffectiveDay(LocalDateTime timestamp, Settings settings) {
        if (timestamp == null) return false;
        LocalDate effectiveDate = getEffectiveDateForTimestamp(timestamp, settings);
        return effectiveDate != null && effectiveDate.equals(getCurrentEffectiveDate(settings));
    }
}
