package com.example.demo.dto;

public class InviteCodeResponse {
    private String inviteCode;

    public InviteCodeResponse(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }
}
