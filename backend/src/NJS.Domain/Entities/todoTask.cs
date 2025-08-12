using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class todoTask
    {
        [Key]
        public int Id { get; set; }
        public int? TaskID { get; set; } // External TaskID from JSON
        public string? TimeSlot { get; set; } // Renamed from Time to match JSON
        public string? Phase { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Cost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CostImpact { get; set; } // Added missing field

        public ICollection<TodoAssignedTo>? AssignedTo { get; set; }
        public ICollection<TodoActivity>? Activities { get; set; }

        [ForeignKey("ProjectSchedule")]
        public int? ProjectScheduleId { get; set; }
        public todoProjectSchedule? ProjectSchedule { get; set; }
    }
}
