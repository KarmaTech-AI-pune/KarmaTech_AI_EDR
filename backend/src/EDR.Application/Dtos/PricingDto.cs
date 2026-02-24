namespace EDR.Application.DTOs
{
    public class PricingDto
    {
        public int Id { get; set; }
        public string Type { get; set; } // Monthly, Onetime, Custom
        public string Currency { get; set; }
        public decimal Amount { get; set; }
        public string Formatted { get; set; }
    }
}

