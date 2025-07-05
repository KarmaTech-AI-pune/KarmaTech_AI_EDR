using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    /// <summary>
    /// Entity to track workflow history for WBS versions
    /// </summary>
    public class WBSVersionWorkflowHistory
    {
        public WBSVersionWorkflowHistory()
        {
            ActionDate = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        [Required]
        public int WBSVersionHistoryId { get; set; }

        [ForeignKey("WBSVersionHistoryId")]
        public WBSVersionHistory WBSVersionHistory { get; set; }

        [Required]
        public int StatusId { get; set; }

        [ForeignKey("StatusId")]
        public PMWorkflowStatus Status { get; set; }

        public string Action { get; set; }
        public string Comments { get; set; }
        public DateTime ActionDate { get; set; }

        [StringLength(450)]
        public string ActionBy { get; set; }

        [ForeignKey("ActionBy")]
        public User ActionUser { get; set; }

        [StringLength(450)]
        public string AssignedToId { get; set; }

        [ForeignKey("AssignedToId")]
        public User AssignedTo { get; set; }
    }
} 