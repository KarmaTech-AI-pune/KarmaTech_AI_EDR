namespace NJS.Domain.Entities
{
    public class ProgrammeSchedule
    {
        public int Id { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string ProgrammeDescription { get; set; }
    }
}
