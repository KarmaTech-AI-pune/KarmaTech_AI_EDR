﻿﻿﻿//File: backend/src/NJS.Domain/Entities/WorkBreakdownStructure.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
{
    public class WorkBreakdownStructure
    {
        public WorkBreakdownStructure()
        {
            Tasks = new List<WBSTask>();
            JobStartForms = new List<JobStartForm>();
            VersionHistory = new List<WBSVersionHistory>();
        }

        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Structure { get; set; }
        public string CurrentVersion { get; set; } // Renamed from Version
        public bool IsActive { get; set; } = true; // Default to active
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; }

        // Version management
        public int? LatestVersionHistoryId { get; set; }
        public int? ActiveVersionHistoryId { get; set; }

        public Project Project { get; set; }
        public ICollection<WBSTask> Tasks { get; set; }
        public ICollection<JobStartForm> JobStartForms { get; set; }
        public ICollection<WBSVersionHistory> VersionHistory { get; set; }

        // Navigation properties for version management
        [ForeignKey("LatestVersionHistoryId")]
        public WBSVersionHistory LatestVersion { get; set; }

        [ForeignKey("ActiveVersionHistoryId")]
        public WBSVersionHistory ActiveVersion { get; set; }
    }
}
