using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.Application.Services.IContract
{
    public interface IAuthService
    {
        Task<AuthResult> ValidateUserAsync(string email, string password);
        Task<bool> AssignRoleToUserAsync(User user, string roleName);

        Task<bool> ValidateUserAnsPasswordAsync(string email, string password);
    }
}

