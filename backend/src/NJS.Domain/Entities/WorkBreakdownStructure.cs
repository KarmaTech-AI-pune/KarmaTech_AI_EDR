﻿﻿﻿//File: backend/src/NJS.Domain/Entities/WorkBreakdownStructure.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
{
    public class WorkBreakdownStructure
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Structure { get; set; }
        public string Version { get; set; }
        public bool IsActive { get; set; } = true; // Default to active
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; }

        public Project Project { get; set; }
        public ICollection<WBSTask> Tasks { get; set; }
        public ICollection<JobStartForm> JobStartForms { get; set; } = new List<JobStartForm>();
    }
}
