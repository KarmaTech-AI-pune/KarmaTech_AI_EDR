using System;

namespace NJS.Domain.Entities
{
    public class CurrentMonthAction
    {
        public int Id { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string CMactions { get; set; }
        public DateTime CMAdate { get; set; }
        public string CMAcomments { get; set; }
        public string CMApriority { get; set; }
    }
}
