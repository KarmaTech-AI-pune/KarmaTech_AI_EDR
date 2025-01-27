using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Users.Queries
{
    public class GetUserByIdQuery : IRequest<UserDto>
    {
        public string Id { get; }

        public GetUserByIdQuery(string id)
        {
            Id = id;
        }
    }
}
