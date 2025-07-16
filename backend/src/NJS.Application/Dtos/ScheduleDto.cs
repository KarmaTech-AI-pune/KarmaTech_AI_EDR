using System;

namespace NJS.Application.DTOs
{
    public class ScheduleDto
    {
        public DateTime? DateOfIssueWOLOI { get; set; }
        public DateTime? CompletionDateAsPerContract { get; set; }
        public DateTime? CompletionDateAsPerExtension { get; set; }
        public DateTime? ExpectedCompletionDate { get; set; }
    }
}
