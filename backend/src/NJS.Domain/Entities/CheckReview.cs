using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("CheckReviews")]
    public class CheckReview
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }

        [Required]
        [StringLength(50)]
        public string ActivityNo { get; set; }

        [Required]
        [StringLength(255)]
        public string ActivityName { get; set; }

        [Required]
        [StringLength(500)]
        public string Objective { get; set; }

        [StringLength(500)]
        public string References { get; set; }

        [StringLength(255)]
        public string FileName { get; set; }

        [StringLength(500)]
        public string QualityIssues { get; set; }

        [Required]
        [StringLength(1)]
        public string Completion { get; set; } = "N";

        [StringLength(255)]
        public string CheckedBy { get; set; }

        [StringLength(255)]
        public string ApprovedBy { get; set; }

        [StringLength(500)]
        public string ActionTaken { get; set; }

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
    }
}
