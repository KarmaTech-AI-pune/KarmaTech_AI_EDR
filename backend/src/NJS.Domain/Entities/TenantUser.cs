using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NJS.Domain.Entities
{
    [Table("TenantUsers")]
    public class TenantUser
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public string UserId { get; set; }

        public TenantUserRole Role { get; set; } = TenantUserRole.User;

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        [ForeignKey("TenantId")]
        [JsonIgnore]
        public virtual Tenant Tenant { get; set; }

        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User User { get; set; }
    }

    public enum TenantUserRole
    {
        Owner,
        Admin,
        Manager,
        User
    }
} 