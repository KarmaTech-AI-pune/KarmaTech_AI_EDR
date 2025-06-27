using System;

namespace NJS.Application.DTOs
{
    public class CurrentMonthActionDto
    {
        public string CMactions { get; set; }
        public DateTime CMAdate { get; set; }
        public string CMAcomments { get; set; }
        public string? CMApriority { get; set; }
    }
}
