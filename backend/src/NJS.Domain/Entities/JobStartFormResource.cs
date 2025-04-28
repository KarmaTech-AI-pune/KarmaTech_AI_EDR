using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("JobStartFormResources")]
    public class JobStartFormResource
    {
        [Key]
        public int ResourceId { get; set; }

        [Required]
        public int FormId { get; set; } // Foreign key to JobStartForm

        [ForeignKey("FormId")]
        public virtual JobStartForm JobStartForm { get; set; }

        // Original WBS Task ID this resource is based on
        public int? WBSTaskId { get; set; }
        
        // Task type (0 = Manpower/Time, 1 = ODC/Expenses)
        public int TaskType { get; set; }
        
        // Resource details
        public string Description { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Rate { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Units { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal BudgetedCost { get; set; }
        
        public string Remarks { get; set; }
        
        // For Manpower resources (TaskType = 0)
        public string EmployeeName { get; set; }
        
        // For ODC resources (TaskType = 1)
        public string Name { get; set; }
        
        // Audit fields
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
