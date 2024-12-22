using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Users.Commands
{
    public class CreateUserCommand : IRequest<UserDto>
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public decimal StandardRate { get; set; }
        public bool IsConsultant { get; set; }
        public List<RoleDto> Roles { get; set; } = [];
        public string Avatar { get; set; }
    }
}
