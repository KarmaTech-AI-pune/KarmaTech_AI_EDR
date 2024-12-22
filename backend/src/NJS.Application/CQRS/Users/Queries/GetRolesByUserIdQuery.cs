using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Queries
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
