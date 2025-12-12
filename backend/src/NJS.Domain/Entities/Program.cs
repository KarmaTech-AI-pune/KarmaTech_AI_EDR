using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class Program : ITenantEntity
    {
        [Key]
        public int Id { get; set; } // program_id (PK)

        public int TenantId { get; set; }

        [Required]
        public string Name { get; set; }

        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime? LastModifiedAt { get; set; } // Assuming this maps to updated_by

        public string? LastModifiedBy { get; set; } // Assuming this maps to updated_by

        // Navigation property for the one-to-many relationship with Project
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
