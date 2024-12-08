using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class WBSTask
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public WBSTaskLevel Level { get; set; }

        public int? ParentId { get; set; }

        [ForeignKey("ParentId")]
        public WBSTask Parent { get; set; }

        public ICollection<WBSTask> Children { get; set; }

        // Project relationship
        public int WorkBreakdownStructureId { get; set; }
        public WorkBreakdownStructure WorkBreakdownStructure { get; set; }

        // Resource allocation
        public int? ResourceAllocation { get; set; }

        // Many-to-many relationship with User
        public ICollection<UserWBSTask> UserWBSTasks { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public WBSTask()
        {
            Children = new List<WBSTask>();
            UserWBSTasks = new List<UserWBSTask>();
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
