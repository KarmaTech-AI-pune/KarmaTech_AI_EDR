using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace NJS.Domain.Entities
{
    public class PMWorkflowStatus
    {
        [Key]
        public int Id { get; set; }
        public string Status { get; set; }

        // Navigation properties
        public ICollection<ChangeControlWorkflowHistory> ChangeControlHistories { get; set; } = new List<ChangeControlWorkflowHistory>();
        public ICollection<ProjectClosureWorkflowHistory> ProjectClosureHistories { get; set; } = new List<ProjectClosureWorkflowHistory>();
        public ICollection<WBSHistory> WBSHistories { get; set; } = new List<WBSHistory>();

        public ICollection<ChangeControl> ChangeControls { get; set; } = new List<ChangeControl>();
        public ICollection<ProjectClosure> ProjectClosures { get; set; } = new List<ProjectClosure>();

    }
}
