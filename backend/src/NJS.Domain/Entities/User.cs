using Microsoft.AspNetCore.Identity;
using System.Diagnostics.CodeAnalysis;

namespace NJS.Domain.Entities
{
    public class User: IdentityUser
    {

        
        public string? Avatar { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        public ICollection<UserWBSTask> UserWBSTasks { get; set; }
    }
}
