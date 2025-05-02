using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("CorrespondenceOutwards")]
    public class CorrespondenceOutward
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }

        [Required]
        [StringLength(255)]
        public string LetterNo { get; set; }

        [Required]
        public DateTime LetterDate { get; set; }

        [Required]
        [StringLength(255)]
        public string To { get; set; }

        [Required]
        [StringLength(500)]
        public string Subject { get; set; }

        [StringLength(500)]
        public string AttachmentDetails { get; set; }

        [StringLength(500)]
        public string ActionTaken { get; set; }

        [StringLength(500)]
        public string StoragePath { get; set; }

        [StringLength(1000)]
        public string Remarks { get; set; }

        [StringLength(255)]
        public string Acknowledgement { get; set; }

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
    }
}
