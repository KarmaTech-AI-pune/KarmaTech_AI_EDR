using EDR.Domain.Entities;

namespace EDR.Application.Dtos
{
    public enum AuthResultType
    {
        Success,
        InvalidCredentials,
        UserInactive,
        TenantInactive,
        NoTenantMapping,
        Error
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public User User { get; set; }
        public string Token { get; set; }
        public AuthResultType ResultType { get; set; }
        public string Message { get; set; }

        public static AuthResult Succeeded(User user, string token) => new AuthResult 
        { 
            Success = true, 
            User = user, 
            Token = token, 
            ResultType = AuthResultType.Success 
        };

        public static AuthResult Failed(AuthResultType type, string message) => new AuthResult 
        { 
            Success = false, 
            ResultType = type, 
            Message = message 
        };
    }
}
