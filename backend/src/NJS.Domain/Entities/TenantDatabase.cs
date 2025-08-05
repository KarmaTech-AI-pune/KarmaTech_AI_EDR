using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NJS.Domain.Entities
{
    public class TenantDatabase
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        [MaxLength(255)]
        public string DatabaseName { get; set; }

        [MaxLength(255)]
        public string ConnectionString { get; set; }

        public DatabaseStatus Status { get; set; } = DatabaseStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastBackup { get; set; }

        [ForeignKey("TenantId")]
        [JsonIgnore]
        public virtual Tenant Tenant { get; set; }
    }

    public enum DatabaseStatus
    {
        Active,
        Provisioning,
        Suspended,
        Deleted
    }
} 