using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Users.Queries
{
    public class GetAllRolesWithPermissionsQuery : IRequest<IList<RoleDefination>>
    {
        // Optional: Add any filtering or additional parameters if needed
        public string? RoleId { get; set; }
    }
}

