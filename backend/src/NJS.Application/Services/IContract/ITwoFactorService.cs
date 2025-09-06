using NJS.Application.Dtos;

namespace NJS.Application.Services.IContract
{
    public interface ITwoFactorService
    {
        Task<OtpSentResponse> SendOtpAsync(string email);
        Task<TwoFactorResponse> VerifyOtpAsync(string email, string otpCode);
        Task<bool> ValidateOtpAsync(string email, string otpCode);
        Task<bool> IsOtpRequiredAsync(string email);
        Task<bool> EnableTwoFactorAsync(string userId);
        Task<bool> DisableTwoFactorAsync(string userId);
        Task<bool> IsTwoFactorEnabledAsync(string userId);
    }
}


