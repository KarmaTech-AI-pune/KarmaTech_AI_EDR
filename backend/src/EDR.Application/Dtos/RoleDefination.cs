using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class RoleDefination
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal MinRate {  get; set; }   
        public bool IsResourceRole {  get; set; }   
        public List<PermissionCategoryGroup> Permissions { get; set; } = new List<PermissionCategoryGroup>();
    }

    public class PermissionCategory
    {
        public string Category { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new List<string>();
    }
}

