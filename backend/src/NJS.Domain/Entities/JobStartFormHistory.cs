using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("JobStartFormHistories")]
    public class JobStartFormHistory
    {
        public JobStartFormHistory()
        {
            ActionDate = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        [Required]
        public int JobStartFormHeaderId { get; set; }

        [ForeignKey("JobStartFormHeaderId")]
        public JobStartFormHeader JobStartFormHeader { get; set; }

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
