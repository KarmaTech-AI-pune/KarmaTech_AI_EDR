using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class TodoSubTask
    {
        [Key]
        public int Id { get; set; }

        public int? SubTaskID { get; set; } // External from JSON
        public string? Description { get; set; }

        public int? PhaseActivityId { get; set; }
        [ForeignKey("PhaseActivityId")]
        public todoPhaseActivity? PhaseActivity { get; set; }
    }
}
