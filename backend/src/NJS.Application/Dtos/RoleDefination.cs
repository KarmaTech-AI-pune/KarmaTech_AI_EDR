using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class RoleDefination
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public List<PermissionCategory> Permissions { get; set; } = new List<PermissionCategory>();
    }

    public class PermissionCategory
    {
        public string Category { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new List<string>();
    }
}
