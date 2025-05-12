namespace NJS.Domain.Entities
{
    public class WBSTaskMonthlyHourHeader
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; }
        public TaskType? TaskType { get; set; }

        public ICollection<WBSTaskMonthlyHour> MonthlyHours { get; set; } = new HashSet<WBSTaskMonthlyHour>();
        public ICollection<WBSHistory> WBSHistories { get; set; } = [];
    }
}
