namespace NJS.Application.Dtos.Cashflow
{
    public class PaymentScheduleItemDto
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public decimal Percentage { get; set; }
        public decimal AmountINR { get; set; }
        public string DueDate { get; set; }
        public string Status { get; set; }
    }
}