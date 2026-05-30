package com.dailyquestion.web.dto;

import java.util.List;

public record QuestionStateResponse(
        List<CategoryResponse> categories,
        List<QuestionResponse> questions
) {
}
