using System.Collections.Generic;
using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Users.Queries
{
    public class GetAllPermissionsQuery : IRequest<IEnumerable<PermissionDto>>
    {
    }
}

