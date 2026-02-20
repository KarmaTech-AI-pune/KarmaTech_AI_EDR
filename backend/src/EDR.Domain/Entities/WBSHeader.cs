using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; // Added for ForeignKey
using EDR.Domain.Enums;
using EDR.Domain.Entities;

namespace EDR.Domain.Entities
{
    public class WBSHeader : ITenantEntity
    {
        public WBSHeader()
        {
            WorkBreakdownStructures = new List<WorkBreakdownStructure>();
        }

        public int Id { get; set; }
        public int TenantId { get; set; }
        public int ProjectId { get; set; }
        public string Version { get; set; } // e.g., v1.0, v2.0
        public DateTime VersionDate { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; }
        public bool IsActive { get; set; } = true;
        public PMWorkflowStatusEnum ApprovalStatus { get; set; } // Using existing enum, only 'Approved' is relevant for approval status

        public int? LatestVersionHistoryId { get; set; }
        public int? ActiveVersionHistoryId { get; set; }

        public Project Project { get; set; }
        public ICollection<WorkBreakdownStructure> WorkBreakdownStructures { get; set; } // Navigation property for WorkBreakdownStructures
        public ICollection<WBSVersionHistory> VersionHistories { get; set; } // Navigation property for WBS Version History

        [ForeignKey("LatestVersionHistoryId")]
        public WBSVersionHistory LatestVersion { get; set; }

        [ForeignKey("ActiveVersionHistoryId")]
        public WBSVersionHistory ActiveVersion { get; set; }
    }
}

