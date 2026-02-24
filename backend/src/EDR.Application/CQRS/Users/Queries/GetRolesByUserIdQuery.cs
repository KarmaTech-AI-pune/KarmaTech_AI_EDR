using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Users.Queries
{
    public class GetRolesByUserIdQuery : IRequest<IList<RoleDto>>
    {
        public User User { get; }

        public GetRolesByUserIdQuery(User user)
        {
            User = user;
        }
    }
}

