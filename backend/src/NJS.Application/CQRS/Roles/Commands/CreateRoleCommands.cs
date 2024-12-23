using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Roles.Commands
{
    public class CreateRoleCommands : IRequest<bool>
    {
        public RoleDefination RoleDefination { get; set; }
        public CreateRoleCommands(RoleDefination roleDefination)
        {
            RoleDefination = roleDefination;
        }

    }
}
