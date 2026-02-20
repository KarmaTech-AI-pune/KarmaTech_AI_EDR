using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class RoleDefinitionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new List<string>();
    }
}

