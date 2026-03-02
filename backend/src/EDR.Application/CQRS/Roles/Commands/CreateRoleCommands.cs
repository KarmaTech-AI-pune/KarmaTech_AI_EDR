using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Roles.Commands
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

