namespace EDR.Application.Dtos.ProgramDashboard
{
    public class ProgramProfitMarginDto
    {
        public decimal ExpectedProfitMargin { get; set; }
        public string ExpectedProfitMarginChangeDescription { get; set; }
        public string ExpectedProfitMarginChangeType { get; set; }

        public decimal ActualProfitMargin { get; set; }
        public string ActualProfitMarginChangeDescription { get; set; }
        public string ActualProfitMarginChangeType { get; set; }
    }
}
