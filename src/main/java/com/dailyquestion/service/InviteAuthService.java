package com.dailyquestion.service;

import com.dailyquestion.config.InviteProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class InviteAuthService {

    private final InviteProperties inviteProperties;

    public InviteAuthService(InviteProperties inviteProperties) {
        this.inviteProperties = inviteProperties;
    }

    public void assertValid(String inviteToken, String passcode) {
        if (!inviteProperties.getToken().equals(inviteToken) || !inviteProperties.getPasscode().equals(passcode)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "邀请链接或口令无效");
        }
    }
}
