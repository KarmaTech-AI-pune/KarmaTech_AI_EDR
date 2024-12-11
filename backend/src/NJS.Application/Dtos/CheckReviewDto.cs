namespace NJS.Application.Dtos
{
    public class CheckReviewDto
    {
        public string ProjectId { get; set; }
        public string ActivityNo { get; set; }
        public string ActivityName { get; set; }
        public string Objective { get; set; }
        public string References { get; set; }
        public string FileName { get; set; }
        public string QualityIssues { get; set; }
        public string Completion { get; set; }
        public string CheckedBy { get; set; }
        public string ApprovedBy { get; set; }
        public string ActionTaken { get; set; }
    }
}
