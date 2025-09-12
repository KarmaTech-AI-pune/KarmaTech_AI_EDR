using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class todoPhase
    {
        [Key]
        public int Id { get; set; }
        public string? PhaseName { get; set; }

        public int? SprintId { get; set; }
        [ForeignKey("SprintId")]
        public TodoSprint? Sprint { get; set; }

        public ICollection<todoPhaseActivity>? Activities { get; set; }
    }
}
