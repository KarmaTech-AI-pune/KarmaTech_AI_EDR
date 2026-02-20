using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace EDR.Domain.Entities
{
    [Table("JobStartForms")]
    public class JobStartForm : ITenantEntity
    {
        [Key]
        public int FormId { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int ProjectId { get; set; } // Foreign key to Project

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }

        // Foreign key to link with WorkBreakdownStructure if needed
        public int? WorkBreakdownStructureId { get; set; }

        [ForeignKey("WorkBreakdownStructureId")]
        [InverseProperty("JobStartForms")]
        public virtual WorkBreakdownStructure WorkBreakdownStructure { get; set; }

        // Basic form details
        public string? FormTitle { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public string? PreparedBy { get; set; }

        // Calculated and financial fields - Stored directly
        public decimal TotalTimeCost { get; set; }      // From TimeDataDto
        public decimal TotalExpenses { get; set; }      // From ExpensesDataDto
        public decimal GrandTotal { get; set; }         // Calculated on frontend
        public decimal ProjectFees { get; set; }        // Input on frontend
        public decimal ServiceTaxPercentage { get; set; } // From ServiceTaxDataDto
        public decimal ServiceTaxAmount { get; set; }   // From ServiceTaxDataDto
        public decimal TotalProjectFees { get; set; }   // Calculated on frontend
        public decimal Profit { get; set; }             // Calculated on frontend
        public decimal ProfitPercentage { get; set; }   // Calculated on frontend

        // Navigation property for related selections/options
        public virtual ICollection<JobStartFormSelection> Selections { get; set; } = new List<JobStartFormSelection>();

        // Navigation property for related resources
        public virtual ICollection<JobStartFormResource> Resources { get; set; } = new List<JobStartFormResource>();

        // Navigation property for header (workflow status)
        public virtual JobStartFormHeader Header { get; set; }

        // Audit fields
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; } = false;

        // JSON properties and helpers removed
    }
}

