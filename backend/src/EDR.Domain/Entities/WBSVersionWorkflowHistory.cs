using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EDR.Domain.Entities
{
    /// <summary>
    /// Entity to track workflow history for WBS versions
    /// </summary>
    public class WBSVersionWorkflowHistory : ITenantEntity
    {
        public WBSVersionWorkflowHistory()
        {
            ActionDate = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int WBSVersionHistoryId { get; set; }

        [ForeignKey("WBSVersionHistoryId")]
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual WBSVersionHistory WBSVersionHistory { get; set; }

        [Required]
        public int StatusId { get; set; }

        [ForeignKey("StatusId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual PMWorkflowStatus Status { get; set; }

        public string Action { get; set; }
        public string Comments { get; set; }
        public DateTime ActionDate { get; set; }

        [StringLength(450)]
        public string ActionBy { get; set; }

        [ForeignKey("ActionBy")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual User ActionUser { get; set; }

        [StringLength(450)]
        public string AssignedToId { get; set; }

        [ForeignKey("AssignedToId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual User AssignedTo { get; set; }
    }
}

