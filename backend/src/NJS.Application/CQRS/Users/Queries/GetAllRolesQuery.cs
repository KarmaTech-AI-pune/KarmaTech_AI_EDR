using System.Collections.Generic;
using MediatR;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Queries
{
    public class GetAllRolesQuery : IRequest<IEnumerable<Role>>
    {
        public GetAllRolesQuery()
        {
        }
    }
}
