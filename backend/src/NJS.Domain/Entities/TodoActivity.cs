 using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class TodoActivity
    {
        [Key]
        public int Id { get; set; }

        public string? Activity { get; set; }

        public decimal? ActivityCost { get; set; }

        public int? TaskId { get; set; }

        [ForeignKey("TaskId")]
        public todoTask? Task { get; set; }

    }
}
