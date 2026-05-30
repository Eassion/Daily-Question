package com.dailyquestion.web.dto;

import java.time.LocalDateTime;
import java.util.List;

public record QuestionResponse(
        String id,
        String title,
        String body,
        String categoryId,
        String categoryName,
        List<String> tags,
        String uploaderName,
        LocalDateTime uploadedAt,
        String sourceUrl,
        String answer,
        String answerAuthor,
        LocalDateTime answeredAt
) {
}
