﻿﻿using System;
using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal StandardRate { get; set; }
        public bool IsConsultant { get; set; }
        public string Avatar { get; set; } = string.Empty;
        public List<RoleDto> Roles { get; set; } = new List<RoleDto>();
        public List<string> Permissions { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int? TenantId { get; set; }
        public string? TenantDomain { get; set; }
        public bool TwoFactorEnabled { get; set; } = false;
        public List<string> Features { get; set; } = new List<string>();
    }
}

