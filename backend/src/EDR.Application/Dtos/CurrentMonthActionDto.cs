using System;

namespace EDR.Application.DTOs
{
    public class CurrentMonthActionDto
    {
        public string? Actions { get; set; }
        public DateTime? Date { get; set; }
        public string? Comments { get; set; }
        public string? Priority { get; set; }
    }
}

