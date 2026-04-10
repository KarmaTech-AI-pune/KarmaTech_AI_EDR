namespace EDR.Application.Dtos.ProjectDashboard
{
    public class PendingFormDto
    {
        public string FormType { get; set; }
        public int FormId { get; set; }
        public int ProjectId { get; set; }
        public int StatusId { get; set; }
        public string FormName { get; set; }
        public string ProjectName { get; set; }
        public string HoldingUserName { get; set; }

        // Keeping old ones for backward compatibility if needed by other handlers
        public int Id { get; set; }
        public string Project { get; set; }
        public string FormTitle { get; set; }
        public string Duration { get; set; }
        public string Status { get; set; }
    }
}
