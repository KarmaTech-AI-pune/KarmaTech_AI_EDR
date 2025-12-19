using NJS.Domain.Enums;

namespace NJS.Application.Dtos
{
    public class GoNoGoSummaryDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int TotalScore { get; set; }
        public int RawTotalScore { get; set; }
        public bool IsScoreCapped { get; set; }
        public GoNoGoStatus Status { get; set; }
        public string? DecisionComments { get; set; }
        public DateTime CompletedDate { get; set; }
        public string? CompletedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? ApprovedBy { get; set; }
    }
}