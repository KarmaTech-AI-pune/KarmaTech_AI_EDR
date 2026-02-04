namespace NJS.Application.Dtos
{
    public class SprintTaskSummaryDto
    {
        public int Taskid { get; set; }
        public string? TaskTitle { get; set; }
        public int? StoryPoints { get; set; }
        public string? TaskAssigneeName { get; set; }
        public string? Taskstatus { get; set; }
        public string? Taskpriority { get; set; }
    }
}
