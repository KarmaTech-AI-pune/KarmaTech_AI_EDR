using System;
using NJS.Domain.Enums;

namespace NJS.Application.Dtos
{
    public class GoNoGoVersionDto
    {
        public int Id { get; set; }
        public int GoNoGoDecisionHeaderId { get; set; }
        public int VersionNumber { get; set; }
        public string FormData { get; set; }
        public GoNoGoVersionStatus Status { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string Comments { get; set; }
    }

    public class CreateGoNoGoVersionDto
    {
        public int GoNoGoDecisionHeaderId { get; set; }
        public string FormData { get; set; }
        public string Comments { get; set; }
    }

    public class ApproveGoNoGoVersionDto
    {
        public string ApprovedBy { get; set; }
        public string Comments { get; set; }
    }
}
