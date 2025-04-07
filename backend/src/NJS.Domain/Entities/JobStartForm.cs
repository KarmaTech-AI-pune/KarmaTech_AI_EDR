using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

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
        public int? WorkBreakdownStructureId { get; set; }

        [ForeignKey("WorkBreakdownStructureId")]
        [InverseProperty("JobStartForms")]
        public virtual WorkBreakdownStructure WorkBreakdownStructure { get; set; }

        // Basic form details
        public string? FormTitle { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public string? PreparedBy { get; set; }

        // JSON serialized complex objects to match frontend structure
        [Column(TypeName = "nvarchar(max)")]
        public string TimeDataJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ExpensesDataJson { get; set; }

        // Calculated and financial fields
        public decimal GrandTotal { get; set; }
        public decimal ProjectFees { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ServiceTaxJson { get; set; }

        public decimal TotalProjectFees { get; set; }
        public decimal Profit { get; set; }

        // Navigation property for related selections/options
        public virtual ICollection<JobStartFormSelection> Selections { get; set; } = new List<JobStartFormSelection>();

        // Audit fields
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Helper methods for serialization/deserialization
        [NotMapped]
        public object TimeData
        {
            get => string.IsNullOrEmpty(TimeDataJson) 
                ? null 
                : JsonSerializer.Deserialize<object>(TimeDataJson);
            set => TimeDataJson = value == null 
                ? null 
                : JsonSerializer.Serialize(value);
        }

        [NotMapped]
        public object ExpensesData
        {
            get => string.IsNullOrEmpty(ExpensesDataJson) 
                ? null 
                : JsonSerializer.Deserialize<object>(ExpensesDataJson);
            set => ExpensesDataJson = value == null 
                ? null 
                : JsonSerializer.Serialize(value);
        }

        [NotMapped]
        public object ServiceTax
        {
            get => string.IsNullOrEmpty(ServiceTaxJson) 
                ? null 
                : JsonSerializer.Deserialize<object>(ServiceTaxJson);
            set => ServiceTaxJson = value == null 
                ? null 
                : JsonSerializer.Serialize(value);
        }
    }
}
