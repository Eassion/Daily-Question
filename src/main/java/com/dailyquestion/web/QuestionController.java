package com.dailyquestion.web;

import com.dailyquestion.service.QuestionService;
import com.dailyquestion.web.dto.AnswerQuestionRequest;
import com.dailyquestion.web.dto.CreateQuestionRequest;
import com.dailyquestion.web.dto.QuestionResponse;
import com.dailyquestion.web.dto.QuestionStateResponse;
import com.dailyquestion.web.dto.UpdateQuestionRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public QuestionStateResponse getState() {
        return questionService.getState();
    }

    @PostMapping
    public QuestionResponse createQuestion(@Valid @RequestBody CreateQuestionRequest request) {
        return questionService.createQuestion(request);
    }

    @PatchMapping
    public QuestionResponse updateQuestion(@Valid @RequestBody UpdateQuestionRequest request) {
        return questionService.updateQuestion(request);
    }

    @PutMapping
    public QuestionResponse answerQuestion(@Valid @RequestBody AnswerQuestionRequest request) {
        return questionService.answerQuestion(request);
    }
}
