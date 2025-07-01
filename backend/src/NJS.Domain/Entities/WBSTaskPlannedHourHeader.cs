using NJS.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class WBSTaskPlannedHourHeader
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; }
        public TaskType? TaskType { get; set; }

        // Status tracking
        public int StatusId { get; set; } = (int)PMWorkflowStatusEnum.Initial; // Default to Initial

        [ForeignKey("StatusId")]
        public PMWorkflowStatus Status { get; set; }

        public ICollection<WBSTaskPlannedHour> PlannedHours { get; set; } = new HashSet<WBSTaskPlannedHour>();
        public ICollection<WBSHistory> WBSHistories { get; set; } = [];
    }
}
