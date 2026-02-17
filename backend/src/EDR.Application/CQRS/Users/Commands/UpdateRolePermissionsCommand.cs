using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Users.Commands
{
    public class UpdateRolePermissionsCommand : IRequest<bool>
    {
        public string RoleId { get; set; }
        public RoleDefination RoleDefination { get; set; }

        public UpdateRolePermissionsCommand(string roleId, RoleDefination roleDefination)
        {
            RoleId = roleId;
            RoleDefination = roleDefination;
        }
    }
}

