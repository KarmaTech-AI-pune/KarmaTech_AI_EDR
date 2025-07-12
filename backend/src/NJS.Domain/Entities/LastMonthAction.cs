using System;

namespace NJS.Domain.Entities
{
    public class LastMonthAction
    {
        public int Id { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string? LMactions { get; set; }
        public DateTime? LMAdate { get; set; }
        public string? LMAcomments { get; set; }
    }
}
