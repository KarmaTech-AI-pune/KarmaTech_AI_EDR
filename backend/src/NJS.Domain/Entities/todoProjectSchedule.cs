using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class todoProjectSchedule
    {
        [Key]
        public int Id { get; set; }
        public DateTime? Date { get; set; }

        public int ProjectId { get; set; }
        public Project? Project { get; set; }
        // This was used by WBSTask - keeping for compatibility
    }
}
