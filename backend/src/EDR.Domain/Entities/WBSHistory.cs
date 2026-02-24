using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EDR.Domain.Entities
{
    /// <summary>
    /// This model is used to track project workflow history
    /// </summary>
    public class WBSHistory : ITenantEntity
    {
        public WBSHistory()
        {
            ActionDate = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int WBSTaskPlannedHourHeaderId { get; set; }

        [ForeignKey("WBSTaskPlannedHourHeaderId")]
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual WBSTaskPlannedHourHeader WBSTaskPlannedHourHeader { get; set; }

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
        public bool IsDeleted { get; set; } = false;
    }
}

