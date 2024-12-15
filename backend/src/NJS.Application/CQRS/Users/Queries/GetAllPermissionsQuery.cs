using System.Collections.Generic;
using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Users.Queries
{
    public class GetAllPermissionsQuery : IRequest<IEnumerable<PermissionDto>>
    {
    }
}
