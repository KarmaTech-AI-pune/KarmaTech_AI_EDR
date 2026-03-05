namespace EDR.Application.Dtos.Cashflow
{
    public class CreatePaymentScheduleItemDto
    {
        public string Description { get; set; }
        public decimal Percentage { get; set; }
        public decimal AmountINR { get; set; }
        public string DueDate { get; set; }
    }
}