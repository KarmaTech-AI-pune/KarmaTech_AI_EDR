using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string EntityName { get; set; }

        [Required]
        [MaxLength(50)]
        public string Action { get; set; }

        [Required]
        public string EntityId { get; set; }

        [Required]
        public string OldValues { get; set; }

        [Required]
        public string NewValues { get; set; }

        [Required]
        [MaxLength(100)]
        public string ChangedBy { get; set; }

        [Required]
        public DateTime ChangedAt { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }

        [MaxLength(50)]
        public string? IpAddress { get; set; }

        [MaxLength(500)]
        public string? UserAgent { get; set; }
    }
}
