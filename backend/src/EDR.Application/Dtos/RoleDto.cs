namespace EDR.Application.Dtos
{
    public class RoleDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public class RoleDefinationdto
    {
        public string Id { get; set; }
        public string Name { get; set; }

        //public List<PermissionDto> Permissions { get; set; } = [];
        public List<PermissionCategoryGroup> Permissions { get; set; } = [];
    }

}

