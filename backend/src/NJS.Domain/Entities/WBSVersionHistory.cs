using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace NJS.Domain.Entities
{
    /// <summary>
    /// Entity to track WBS version history with workflow support
    /// </summary>
    public class WBSVersionHistory : ITenantEntity
    {
        public WBSVersionHistory()
        {
            CreatedAt = DateTime.UtcNow;
            TaskVersions = new List<WBSTaskVersionHistory>();
            WorkflowHistories = new List<WBSVersionWorkflowHistory>();
        }

        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int WBSHeaderId { get; set; } // Foreign key to WBSHeader

        [Required]
        [StringLength(20)]
        public string Version { get; set; }

        [StringLength(1000)]
        public string Comments { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        [StringLength(450)]
        public string CreatedBy { get; set; }

        // Workflow status tracking
        public int StatusId { get; set; } = (int)PMWorkflowStatusEnum.Initial;

        [ForeignKey("StatusId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual PMWorkflowStatus Status { get; set; }

        // Version metadata
        public bool IsActive { get; set; } = false; // Only one version can be active
        public bool IsLatest { get; set; } = false; // Latest version flag
        public DateTime? ApprovedAt { get; set; }
        public string ApprovedBy { get; set; }

        // Navigation properties
        [ForeignKey("WBSHeaderId")]
        [InverseProperty("VersionHistories")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual WBSHeader WBSHeader { get; set; }

        [ForeignKey("CreatedBy")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual User CreatedByUser { get; set; }

        [ForeignKey("ApprovedBy")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual User ApprovedByUser { get; set; }

        public ICollection<WBSTaskVersionHistory> TaskVersions { get; set; }
        public ICollection<WBSVersionWorkflowHistory> WorkflowHistories { get; set; }
    }
}
