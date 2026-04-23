using System.Collections.Generic;

namespace EDR.Application.Dtos.Dashboard
{
    public class TaskPriorityItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Project { get; set; }
        public string Assignee { get; set; }
        public string Category { get; set; }
    }
}
