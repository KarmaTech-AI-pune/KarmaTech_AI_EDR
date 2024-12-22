using MediatR;
using Microsoft.AspNetCore.Identity;
using NJS.Application.CQRS.Users.Commands;
using NJS.Domain.Entities;
using System.Runtime.InteropServices;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, bool>
    {
        private readonly UserManager<User> _userManager;
        public DeleteUserCommandHandler(UserManager<User> userManager)
        {
            _userManager=userManager;
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
                var result = await _userManager.DeleteAsync(user).ConfigureAwait(false);
                return true;
            }
            catch
            {
                throw;
            }
        }
    }
}
