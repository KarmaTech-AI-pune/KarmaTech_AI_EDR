using System;

namespace NJS.Application.Dtos
{
    public class MonthlyHourDto
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public string Year { get; set; }
        public string Month { get; set; }
        public decimal PlannedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
