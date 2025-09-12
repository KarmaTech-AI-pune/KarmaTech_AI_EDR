using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class todoPhaseActivity
    {
        [Key]
        public int Id { get; set; }

        public int? ActivityID { get; set; } // External from JSON
        public DateTime? Date { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }

        public int? PhaseId { get; set; }
        [ForeignKey("PhaseId")]
        public todoPhase? Phase { get; set; }

        public ICollection<TodoSubTask>? SubTasks { get; set; }
    }
}
