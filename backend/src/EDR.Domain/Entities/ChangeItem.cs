using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    /// <summary>
    /// Entity representing individual change items within release notes
    /// </summary>
    [Table("ChangeItems")]
    public class ChangeItem : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int ReleaseNotesId { get; set; }

        [Required]
        [MaxLength(20)]
        public string ChangeType { get; set; } // Feature, BugFix, Improvement, Breaking

        [Required]
        [MaxLength(500)]
        public string Description { get; set; }

        [MaxLength(40)]
        public string CommitSha { get; set; }

        [MaxLength(20)]
        public string JiraTicket { get; set; }

        [MaxLength(10)]
        public string Impact { get; set; } // Low, Medium, High

        [MaxLength(100)]
        public string Author { get; set; }

        // Navigation property
        [ForeignKey(nameof(ReleaseNotesId))]
        public virtual ReleaseNotes ReleaseNotes { get; set; }
    }
}
