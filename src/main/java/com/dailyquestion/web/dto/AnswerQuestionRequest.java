package com.dailyquestion.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AnswerQuestionRequest {

    @NotBlank
    private String inviteToken;

    @NotBlank
    private String passcode;

    @NotBlank
    private String questionId;

    @NotBlank
    @Size(max = 40)
    private String answerAuthor;

    @NotBlank
    private String answer;

    public String getInviteToken() {
        return inviteToken;
    }

    public void setInviteToken(String inviteToken) {
        this.inviteToken = inviteToken;
    }

    public String getPasscode() {
        return passcode;
    }

    public void setPasscode(String passcode) {
        this.passcode = passcode;
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public String getAnswerAuthor() {
        return answerAuthor;
    }

    public void setAnswerAuthor(String answerAuthor) {
        this.answerAuthor = answerAuthor;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
