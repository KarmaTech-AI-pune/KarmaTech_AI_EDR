using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Permissions.Queries
{
    public class GetAllPermissionsQuery : IRequest<IEnumerable<PermissionDto>>
    {
        // No parameters needed for getting all permissions
    }
}

