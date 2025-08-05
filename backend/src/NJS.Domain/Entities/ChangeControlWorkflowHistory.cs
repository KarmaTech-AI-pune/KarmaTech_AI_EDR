using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class ChangeControlWorkflowHistory : ITenantEntity
    {
        public ChangeControlWorkflowHistory()
        {
            ActionDate = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        public int ChangeControlId { get; set; }

        public int StatusId { get; set; }

        [Required]
        public string Action { get; set; }

        public string Comments { get; set; }

        public DateTime ActionDate { get; set; }

        [Required]
        public string ActionBy { get; set; }

        public string AssignedToId { get; set; }

        // Navigation properties
        [ForeignKey("ChangeControlId")]
        public ChangeControl ChangeControl { get; set; }

        [ForeignKey("StatusId")]
        public PMWorkflowStatus Status { get; set; }

        [ForeignKey("ActionBy")]
        public User ActionUser { get; set; }

        [ForeignKey("AssignedToId")]
        public User AssignedTo { get; set; }
    }
}
