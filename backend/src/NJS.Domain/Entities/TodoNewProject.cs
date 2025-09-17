using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class TodoNewProject
    {
        [Key]
        public int ProjectId { get; set; }   // Primary Key

        [Required]
        public string? ProjectName { get; set; }

        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public ICollection<TodoNewTask>? Tasks { get; set; }   // Navigation Property
    }
}
