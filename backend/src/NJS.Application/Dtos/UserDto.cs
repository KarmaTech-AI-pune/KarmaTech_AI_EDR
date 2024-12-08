using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class UserDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Avatar { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }

    public class AssignRoleModel
    {
        public string UserId { get; set; }
        public string Role { get; set; }
    }
}
