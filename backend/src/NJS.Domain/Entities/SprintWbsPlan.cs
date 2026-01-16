using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class SprintWbsPlan : ITenantEntity
    {
        [Key]
        public int SprintWbsPlanId { get; set; }

        public int TenantId { get; set; }

        public int ProjectId { get; set; }
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }

        public int? WBSTaskId { get; set; }
        public string WBSTaskName { get; set; }

        public int? ParentWBSTaskId { get; set; }

        public Guid? AssignedUserId { get; set; }
        public string? AssignedUserName { get; set; }

        public Guid? RoleId { get; set; }
        public string? RoleName { get; set; }

        public string MonthYear { get; set; }

        public int SprintNumber { get; set; }

        public decimal PlannedHours { get; set; }
        public decimal RemainingHours { get; set; }

        public int ProgramSequence { get; set; }

        public bool IsConsumed { get; set; } = false;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedOn { get; set; }
    }
}
