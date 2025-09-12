using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class TodoSprint
    {
        [Key]
        public int Id { get; set; }

        public string? SprintName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public int? ProjectId { get; set; }
        [ForeignKey("ProjectId")]
        public todoProject? Project { get; set; }

        public ICollection<todoPhase>? Phases { get; set; }
    }
}
