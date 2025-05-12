using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    /// <summary>
    /// This model is used to track project workflow history
    /// </summary>
    public class WBSHistory
    {
        public WBSHistory()
        {
            ActionDate = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }
        public int WBSTaskMonthlyHourHeaderId { get; set; }
        public WBSTaskMonthlyHourHeader WBSTaskMonthlyHourHeader { get; set; }
        public int StatusId { get; set; }
        public PMWorkflowStatus Status { get; set; }
        public string Action { get; set; }
        public string Comments { get; set; }
        public DateTime ActionDate { get; set; }
        public string ActionBy { get; set; }
        public User ActionUser { get; set; }

        public string? AssignedToId { get; set; }

        [ForeignKey("AssignedToId")]
        public User AssignedTo { get; set; }
    }
}
