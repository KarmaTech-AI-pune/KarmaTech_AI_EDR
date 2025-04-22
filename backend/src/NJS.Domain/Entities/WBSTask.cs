﻿﻿﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Enums;  // Already correct - just verifying

namespace NJS.Domain.Entities
{
    public class WBSTask
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WorkBreakdownStructureId { get; set; }

        public int? ParentId { get; set; }

        [Required]
        public WBSTaskLevel Level { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(1000)]
        public string Description { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime CreatedAt { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal EstimatedBudget { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }


        // Navigation properties
        [ForeignKey(nameof(WorkBreakdownStructureId))]
        public WorkBreakdownStructure WorkBreakdownStructure { get; set; }

        [ForeignKey(nameof(ParentId))]
        public WBSTask Parent { get; set; }

        public ICollection<WBSTask> Children { get; set; } = new List<WBSTask>();
        public ICollection<WBSTaskMonthlyHour> MonthlyHours { get; set; } = new List<WBSTaskMonthlyHour>();
        public ICollection<UserWBSTask> UserWBSTasks { get; set; } = new List<UserWBSTask>();
    }
}
