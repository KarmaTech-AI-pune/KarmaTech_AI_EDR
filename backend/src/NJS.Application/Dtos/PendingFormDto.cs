using System;

namespace NJS.Application.DTOs
{
    public class PendingFormDto
    {
        public string FormType { get; set; }
        public int FormId { get; set; }
        public int ProjectId { get; set; }
        public int StatusId { get; set; }
        public object Details { get; set; }
    }
}
