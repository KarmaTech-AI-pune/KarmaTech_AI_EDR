using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EDR.Domain.Entities
{
    public class ProjectClosureWorkflowHistory : ITenantEntity
    {
        public ProjectClosureWorkflowHistory()
        {
            ActionDate = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        
        public int ProjectClosureId { get; set; }
        
        public int StatusId { get; set; }
        
        [Required]
        public string Action { get; set; }
        
        public string Comments { get; set; }
        
        public DateTime ActionDate { get; set; }
        
        [Required]
        public string ActionBy { get; set; }
        
        public string AssignedToId { get; set; }

        // Navigation properties
        [ForeignKey("ProjectClosureId")]
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual ProjectClosure ProjectClosure { get; set; }
        
        [ForeignKey("StatusId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual PMWorkflowStatus Status { get; set; }
        
        [ForeignKey("ActionBy")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual User ActionUser { get; set; }
        
        [ForeignKey("AssignedToId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual User AssignedTo { get; set; }
    }
}

