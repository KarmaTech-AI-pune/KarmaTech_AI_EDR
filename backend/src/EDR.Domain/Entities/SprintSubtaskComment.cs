using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using EDR.Domain.GenericRepository;

namespace EDR.Domain.Entities
{
    public class SprintSubtaskComment : ITenantEntity
    {
        [Key]
        public int SubtaskCommentId { get; set; }

        public int TenantId { get; set; }

        public string? CommentText { get; set; }

        public int Taskid { get; set; } // Foreign key to SprintTask
        [ForeignKey("Taskid")]
        public SprintTask? SprintTask { get; set; }

        public int? SubtaskId { get; set; } // Foreign key to SprintSubtask
        [ForeignKey("SubtaskId")]
        public SprintSubtask? SprintSubtask { get; set; }

        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}

