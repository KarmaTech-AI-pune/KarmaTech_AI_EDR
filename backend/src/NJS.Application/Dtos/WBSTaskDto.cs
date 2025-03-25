using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class WBSTaskDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public int Level { get; set; }
        public string ParentTaskId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public string Status { get; set; }
        public List<string> Resources { get; set; }
        public List<WBSTaskDto> ChildTasks { get; set; }
    }
}
