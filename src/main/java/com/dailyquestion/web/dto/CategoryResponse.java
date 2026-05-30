package com.dailyquestion.web.dto;

import java.time.LocalDateTime;

public record CategoryResponse(
        String id,
        String name,
        LocalDateTime createdAt,
        String createdBy
) {
}
