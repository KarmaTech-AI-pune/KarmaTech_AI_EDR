using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NJS.Domain.Entities
{
    [Table("JobStartFormHistories")]
    public class JobStartFormHistory : ITenantEntity
    {
        public JobStartFormHistory()
        {
            ActionDate = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int JobStartFormHeaderId { get; set; }

        [ForeignKey("JobStartFormHeaderId")]
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual JobStartFormHeader JobStartFormHeader { get; set; }

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
    }
}
