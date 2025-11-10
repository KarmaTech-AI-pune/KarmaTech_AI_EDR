using NJS.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace NJS.Domain.Entities
{
    [Table("JobStartFormHeaders")]
    public class JobStartFormHeader : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        
        [Required]
        public int FormId { get; set; }
        
        [ForeignKey("FormId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual JobStartForm JobStartForm { get; set; }
        
        public int ProjectId { get; set; }
        
        [ForeignKey("ProjectId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual Project Project { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public string CreatedBy { get; set; }
        
        // Status tracking
        public int StatusId { get; set; } = (int)PMWorkflowStatusEnum.Initial; // Default to Initial
        
        [ForeignKey("StatusId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual PMWorkflowStatus Status { get; set; }
        
        // Navigation property for workflow history
        public ICollection<JobStartFormHistory> JobStartFormHistories { get; set; } = new List<JobStartFormHistory>();
    }
}
