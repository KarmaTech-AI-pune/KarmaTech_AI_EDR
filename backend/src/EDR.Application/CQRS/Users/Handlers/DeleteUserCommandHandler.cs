using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.Users.Commands;
using EDR.Domain.Entities;
using System.Runtime.InteropServices;

namespace EDR.Application.CQRS.Users.Handlers
{
    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, bool>
    {
        private readonly UserManager<User> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteUserCommandHandler(UserManager<User> userManager, IHttpContextAccessor httpContextAccessor)
        {
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(request.Id).ConfigureAwait(false);
                if (user is null)
                {
                    return false;
                }

                var currentUser = await _userManager.GetUserAsync(_httpContextAccessor.HttpContext.User);
                if (currentUser == null)
                {
                    throw new ApplicationException("Current user not found.");
                }

                var userRoles = await _userManager.GetRolesAsync(user);
                var currentUserRoles = await _userManager.GetRolesAsync(currentUser);

                // If the current user is an Admin, they can delete any user.
                if (currentUserRoles.Contains("Admin"))
                {
                    // Proceed with deletion.
                }
                // If the current user is a TenantAdmin.
                else if (currentUserRoles.Contains("TenantAdmin"))
                {
                    // A TenantAdmin cannot delete their own account.
                    if (currentUser.Id == user.Id)
                    {
                        throw new ApplicationException("Tenant Admin cannot delete their own account.");
                    }
                    // A TenantAdmin cannot delete another TenantAdmin account.
                    if (userRoles.Contains("TenantAdmin"))
                    {
                        throw new ApplicationException("Tenant Admin cannot delete another Tenant Admin account.");
                    }
                    // If the user to be deleted is NOT a TenantAdmin and is NOT the current user,
                    // then a TenantAdmin CAN delete them. No explicit 'else' needed here,
                    // as the code will proceed to deletion if no exception is thrown.
                }
                // If the current user is neither SuperAdmin nor TenantAdmin, they should not be able to delete any user.
                else
                {
                    throw new ApplicationException("You do not have permission to delete users.");
                }

                var result = await _userManager.DeleteAsync(user).ConfigureAwait(false);
                return true;
            }
            catch (ApplicationException)
            {
                throw;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

