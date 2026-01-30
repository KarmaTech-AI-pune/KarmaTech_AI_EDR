using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    /// <summary>
    /// Entity representing release notes for a specific version
    /// </summary>
    [Table("ReleaseNotes")]
    public class ReleaseNotes : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Version { get; set; }

        [Required]
        public DateTime ReleaseDate { get; set; }

        [Required]
        [MaxLength(20)]
        public string Environment { get; set; }

        [MaxLength(40)]
        public string CommitSha { get; set; }

        [MaxLength(100)]
        public string Branch { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation property for change items
        public virtual ICollection<ChangeItem> ChangeItems { get; set; } = new List<ChangeItem>();
    }
}