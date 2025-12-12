namespace NJS.Application.Dtos.Dashboard
{
    public class MonthlyCashflowDto
    {
        public string Month { get; set; }
        public decimal Planned { get; set; }
        public decimal Actual { get; set; }
        public decimal Variance { get; set; }
    }
}
