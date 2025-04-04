using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("JobStartForms")]
    public class JobStartForm
    {
        [Key]
        public int FormId { get; set; }

        [Required]
        public int ProjectId { get; set; } // Foreign key to Project

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }

        // Foreign key to link with WorkBreakdownStructure if needed
        // Assuming a JobStartForm might be linked to a specific WBS entry
        public int? WorkBreakdownStructureId { get; set; }

        [ForeignKey("WorkBreakdownStructureId")]
        public virtual WorkBreakdownStructure WorkBreakdownStructure { get; set; }

        // Example properties for the Job Start Form
        public string FormTitle { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public string PreparedBy { get; set; }

        // Navigation property for related selections/options
        public virtual ICollection<JobStartFormSelection> Selections { get; set; } = new List<JobStartFormSelection>();

        // Audit fields
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
