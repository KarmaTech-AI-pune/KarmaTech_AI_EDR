namespace NJS.Domain.Entities
{
    public class EarlyWarning
    {
        public int Id { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string? WarningsDescription { get; set; }
    }
}
