using MediatR;
using NJS.Application.Dtos;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.Users.Commands
{
    public class CreateUserCommand : IRequest<UserDto>
    {
        [Required(ErrorMessage = "Username is required")]
        public string UserName { get; set; }
        
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; }
        
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; }
        
        public string? Password { get; set; }
        public decimal StandardRate { get; set; }
        public bool IsConsultant { get; set; }
        public List<RoleDto> Roles { get; set; } = [];
        public string? Avatar { get; set; }
    }
}
