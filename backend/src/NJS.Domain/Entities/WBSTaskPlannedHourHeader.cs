using NJS.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NJS.Domain.Entities
{
    public class WBSTaskPlannedHourHeader : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int ProjectId { get; set; }
        
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; }
        public TaskType? TaskType { get; set; }

        // Status tracking
        public int StatusId { get; set; } = (int)PMWorkflowStatusEnum.Initial; // Default to Initial

        public string Version { get; set; } = "1.0";

        [ForeignKey("StatusId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual PMWorkflowStatus Status { get; set; }

        public ICollection<WBSTaskPlannedHour> PlannedHours { get; set; } = new HashSet<WBSTaskPlannedHour>();
        public ICollection<WBSHistory> WBSHistories { get; set; } = [];
    }
}
