namespace EDR.Application.Dtos
{
    public class TwoFactorLoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class TwoFactorVerifyRequest
    {
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
    }

    public class TwoFactorResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool RequiresOtp { get; set; }
        public string? Token { get; set; }
        public UserDto? User { get; set; }
    }

    public class OtpSentResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}



