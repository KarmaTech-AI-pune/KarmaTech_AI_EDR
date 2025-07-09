namespace NJS.Application.DTOs
{
    public class ChangeOrderDto
    {
        public decimal? ContractTotal { get; set; }
        public decimal? Cost { get; set; }
        public decimal? Fee { get; set; }
        public string? SummaryDetails { get; set; }
        public string? Status { get; set; }
    }
}
