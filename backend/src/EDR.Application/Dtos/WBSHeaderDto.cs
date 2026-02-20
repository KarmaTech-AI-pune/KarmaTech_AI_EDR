using EDR.Domain.Enums;
using System;
using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class WBSHeaderDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Version { get; set; }
        public DateTime VersionDate { get; set; }
        public string CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public PMWorkflowStatusEnum ApprovalStatus { get; set; }
        public int? LatestVersionHistoryId { get; set; }
        public int? ActiveVersionHistoryId { get; set; }

        public ICollection<WBSStructureDto> WorkBreakdownStructures { get; set; }
        public ICollection<WBSVersionDto> VersionHistories { get; set; }
    }
}

