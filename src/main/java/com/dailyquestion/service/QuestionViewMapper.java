package com.dailyquestion.service;

import com.dailyquestion.domain.Category;
import com.dailyquestion.domain.Question;
import com.dailyquestion.web.dto.CategoryResponse;
import com.dailyquestion.web.dto.QuestionResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class QuestionViewMapper {

    public CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getCreatedAt(),
                category.getCreatedBy()
        );
    }

    public QuestionResponse toQuestionResponse(Question question) {
        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getBody(),
                question.getCategoryId(),
                question.getCategoryName(),
                List.copyOf(question.getTags()),
                question.getUploaderName(),
                question.getUploadedAt(),
                question.getSourceUrl(),
                question.getAnswer(),
                question.getAnswerAuthor(),
                question.getAnsweredAt()
        );
    }
}
