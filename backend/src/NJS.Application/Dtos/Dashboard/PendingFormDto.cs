using System;

namespace NJS.Application.DTOs.Dashboard
{
    public class PendingFormDto
    {
        public string FormType { get; set; }
        public int FormId { get; set; } // Changed from Guid to int
        public int ProjectId { get; set; } // Changed from Guid to int
        public int StatusId { get; set; }
        public string FormName { get; set; }
        public string ProjectName { get; set; }
        public string HoldingUserName { get; set; }
    }
}
