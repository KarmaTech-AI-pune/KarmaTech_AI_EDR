using EDR.Domain.Entities;

namespace EDR.Application.Services.IContract
{
    public interface IAuthService
    {
        Task<(bool success, User user, string token)> ValidateUserAsync(string email, string password);
        Task<bool> AssignRoleToUserAsync(User user, string roleName);

        Task<bool> ValidateUserAnsPasswordAsync(string email, string password);
    }
}

