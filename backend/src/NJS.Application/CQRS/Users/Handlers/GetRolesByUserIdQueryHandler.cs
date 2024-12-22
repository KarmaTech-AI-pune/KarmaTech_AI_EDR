using MediatR;
using Microsoft.AspNetCore.Identity;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class GetRolesByUserIdQueryHandler : IRequestHandler<GetRolesByUserIdQuery, IList<RoleDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        public GetRolesByUserIdQueryHandler(UserManager<User> userManager,
            RoleManager<Role> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }
        public  async Task<IList<RoleDto>> Handle(GetRolesByUserIdQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
