using System.Collections.Generic;
using MediatR;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Users.Queries
{
    public class GetAllRolesQuery : IRequest<IEnumerable<Role>>
    {
        public GetAllRolesQuery()
        {
        }
    }
}

