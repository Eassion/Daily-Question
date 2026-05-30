package com.dailyquestion.service;

import com.dailyquestion.domain.Category;
import com.dailyquestion.domain.Question;
import com.dailyquestion.mapper.CategoryMapper;
import com.dailyquestion.mapper.QuestionMapper;
import com.dailyquestion.mapper.QuestionTagMapper;
import com.dailyquestion.web.dto.AnswerQuestionRequest;
import com.dailyquestion.web.dto.CategoryResponse;
import com.dailyquestion.web.dto.CreateQuestionRequest;
import com.dailyquestion.web.dto.QuestionResponse;
import com.dailyquestion.web.dto.QuestionStateResponse;
import com.dailyquestion.web.dto.UpdateQuestionRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class QuestionService {

    private final CategoryMapper categoryMapper;
    private final QuestionMapper questionMapper;
    private final QuestionTagMapper questionTagMapper;
    private final QuestionViewMapper questionViewMapper;
    private final InviteAuthService inviteAuthService;

    public QuestionService(CategoryMapper categoryMapper,
                           QuestionMapper questionMapper,
                           QuestionTagMapper questionTagMapper,
                           QuestionViewMapper questionViewMapper,
                           InviteAuthService inviteAuthService) {
        this.categoryMapper = categoryMapper;
        this.questionMapper = questionMapper;
        this.questionTagMapper = questionTagMapper;
        this.questionViewMapper = questionViewMapper;
        this.inviteAuthService = inviteAuthService;
    }

    public QuestionStateResponse getState() {
        List<CategoryResponse> categories = categoryMapper.findAll().stream()
                .map(questionViewMapper::toCategoryResponse)
                .toList();

        List<QuestionResponse> questions = questionMapper.findAll().stream()
                .map(this::fillTags)
                .map(questionViewMapper::toQuestionResponse)
                .toList();

        return new QuestionStateResponse(categories, questions);
    }

    public QuestionResponse createQuestion(CreateQuestionRequest request) {
        inviteAuthService.assertValid(request.getInviteToken(), request.getPasscode());

        Category category = getOrCreateCategory(request.getCategoryName(), request.getUploaderName());
        LocalDateTime now = LocalDateTime.now();

        Question question = new Question();
        question.setId(UUID.randomUUID().toString());
        question.setTitle(requireText(request.getTitle(), "题目不能为空"));
        question.setBody(requireText(request.getBody(), "题目不能为空"));
        question.setCategoryId(category.getId());
        question.setCategoryName(category.getName());
        question.setTags(normalizeTags(request.getTags()));
        question.setUploaderName(requireText(request.getUploaderName(), "昵称不能为空"));
        question.setUploadedAt(now);
        question.setSourceUrl(clean(request.getSourceUrl()));

        String answer = clean(request.getAnswer());
        question.setAnswer(answer);
        question.setAnswerAuthor(answer == null ? null : question.getUploaderName());
        question.setAnsweredAt(answer == null ? null : now);

        questionMapper.insert(question);
        replaceTags(question.getId(), question.getTags());
        return questionViewMapper.toQuestionResponse(question);
    }

    public QuestionResponse updateQuestion(UpdateQuestionRequest request) {
        inviteAuthService.assertValid(request.getInviteToken(), request.getPasscode());

        Question question = loadQuestion(request.getQuestionId());
        Category category = getOrCreateCategory(request.getCategoryName(), request.getEditorName());
        String answer = clean(request.getAnswer());

        question.setTitle(requireText(request.getTitle(), "题目不能为空"));
        question.setBody(requireText(request.getBody(), "题目不能为空"));
        question.setCategoryId(category.getId());
        question.setCategoryName(category.getName());
        question.setTags(normalizeTags(request.getTags()));
        question.setSourceUrl(clean(request.getSourceUrl()));
        question.setAnswer(answer);
        question.setAnswerAuthor(answer == null ? null : requireText(request.getEditorName(), "编辑者昵称不能为空"));
        question.setAnsweredAt(answer == null ? null : LocalDateTime.now());

        questionMapper.update(question);
        replaceTags(question.getId(), question.getTags());
        return questionViewMapper.toQuestionResponse(question);
    }

    public QuestionResponse answerQuestion(AnswerQuestionRequest request) {
        inviteAuthService.assertValid(request.getInviteToken(), request.getPasscode());

        Question question = loadQuestion(request.getQuestionId());
        if (question.getAnswer() != null && !question.getAnswer().isBlank()) {
            throw new ApiException(HttpStatus.CONFLICT, "这道题已经有答案了");
        }

        question.setAnswer(requireText(request.getAnswer(), "答案不能为空"));
        question.setAnswerAuthor(requireText(request.getAnswerAuthor(), "昵称不能为空"));
        question.setAnsweredAt(LocalDateTime.now());

        questionMapper.update(question);
        return questionViewMapper.toQuestionResponse(question);
    }

    private Category getOrCreateCategory(String name, String author) {
        String categoryName = requireText(name, "分类不能为空");
        Category existing = categoryMapper.findByName(categoryName);
        if (existing != null) {
            return existing;
        }

        Category category = new Category();
        category.setId(UUID.randomUUID().toString());
        category.setName(categoryName);
        category.setCreatedAt(LocalDateTime.now());
        category.setCreatedBy(clean(author) == null ? "匿名" : clean(author));
        categoryMapper.insert(category);
        return category;
    }

    private Question loadQuestion(String questionId) {
        Question question = questionMapper.findById(questionId);
        if (question == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "题目不存在");
        }
        return fillTags(question);
    }

    private Question fillTags(Question question) {
        question.setTags(questionTagMapper.findByQuestionId(question.getId()));
        return question;
    }

    private void replaceTags(String questionId, List<String> tags) {
        questionTagMapper.deleteByQuestionId(questionId);
        if (!tags.isEmpty()) {
            questionTagMapper.batchInsert(questionId, tags);
        }
    }

    private List<String> normalizeTags(List<String> rawTags) {
        if (rawTags == null) {
            return List.of();
        }

        return rawTags.stream()
                .map(this::clean)
                .filter(tag -> tag != null && !tag.isBlank())
                .distinct()
                .limit(8)
                .toList();
    }

    private String requireText(String value, String message) {
        String cleaned = clean(value);
        if (cleaned == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return cleaned;
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
