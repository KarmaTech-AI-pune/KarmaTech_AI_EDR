using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Users.Queries
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

