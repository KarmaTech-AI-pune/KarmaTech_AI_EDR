using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    [Table("CorrespondenceInwards")]
    public class CorrespondenceInward : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }

        [Required]
        [StringLength(255)]
        public string IncomingLetterNo { get; set; }

        [Required]
        public DateTime LetterDate { get; set; }

        [Required]
        [StringLength(255)]
        public string EdrInwardNo { get; set; }

        [Required]
        public DateTime ReceiptDate { get; set; }

        [Required]
        [StringLength(255)]
        public string From { get; set; }

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

        public DateTime? RepliedDate { get; set; }

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
    }
}


