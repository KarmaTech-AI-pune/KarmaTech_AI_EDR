using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class TodoAssignedTo
    {
        [Key]
        public int Id { get; set; }

        public string? Name { get; set; }

        public int? TaskId { get; set; }

        [ForeignKey("TaskId")]
        public todoTask? Task { get; set; }

    }
}
