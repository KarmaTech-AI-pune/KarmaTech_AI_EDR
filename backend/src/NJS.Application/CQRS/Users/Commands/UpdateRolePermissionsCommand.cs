using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Users.Commands
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
