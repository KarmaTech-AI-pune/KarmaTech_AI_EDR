using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.GenericRepository;

namespace NJS.Domain.Entities
{
    public class SprintTaskComment : ITenantEntity
    {
        [Key]
        public int CommentId { get; set; }

        public int TenantId { get; set; }

        public string? CommentText { get; set; }

        public int Taskid { get; set; } // Foreign key to SprintTask
        [ForeignKey("Taskid")]
        public SprintTask? SprintTask { get; set; }

        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
