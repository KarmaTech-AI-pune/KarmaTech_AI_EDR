using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class PermissionDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string Category { get; set; }
        public ICollection<RolePermissionDto> Roles { get; set; } = new List<RolePermissionDto>();        
    }

    public class RolePermissionDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
    }

    public class PermissionCategoryGroup
    {
        public string Category { get; set; }
        public List<PermissionDto> Permissions { get; set; }
    }
}

