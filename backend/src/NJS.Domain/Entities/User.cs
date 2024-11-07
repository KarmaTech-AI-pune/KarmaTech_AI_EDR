//File: backend/src/NJS.Domain/Entities/User.cs
using Microsoft.AspNetCore.Identity;

namespace NJS.Domain.Entities
{
    public class User: IdentityUser
    {        
      
        public string Avatar { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        public ICollection<UserWBSTask> UserWBSTasks { get; set; }
    }
}
