﻿namespace EDR.Application.Services.IContract
{
    public interface IUserContext
    {
        string GetCurrentUserId();
        string GetCurrentUserName();
        string? GetIpAddress();
        string? GetUserAgent();
        string? GetReason();
    }
}

