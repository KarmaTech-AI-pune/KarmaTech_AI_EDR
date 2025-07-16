using System;

namespace NJS.Domain.Entities
{
    public class CurrentMonthAction
    {
        public int Id { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string? Actions { get; set; }
        public DateTime? Date { get; set; }
        public string? Comments { get; set; }
        public string? Priority { get; set; }
    }
}
