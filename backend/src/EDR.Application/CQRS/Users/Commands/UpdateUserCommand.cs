using System.Collections.Generic;
using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Users.Commands
{
    public class UpdateUserCommand : IRequest<UserDto>
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public decimal? StandardRate { get; set; }
        public bool IsConsultant { get; set; }
        public List<RoleDto> Roles { get; set; } = [];
        public string? Avatar { get; set; }
    }
}

