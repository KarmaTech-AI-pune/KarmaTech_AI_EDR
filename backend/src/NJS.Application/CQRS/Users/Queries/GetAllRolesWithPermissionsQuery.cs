using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Users.Queries
{
    public class GetAllRolesWithPermissionsQuery : IRequest<IList<RoleDefination>>
    {
        // Optional: Add any filtering or additional parameters if needed
        public string? RoleId { get; set; }
    }
}
