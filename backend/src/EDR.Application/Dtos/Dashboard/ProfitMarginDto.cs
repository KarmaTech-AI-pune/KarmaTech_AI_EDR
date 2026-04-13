namespace EDR.Application.Dtos.Dashboard
{
    public class ProfitMarginDto
    {
        public decimal ProfitMargin { get; set; } // Kept for backward compatibility if needed
        
        public decimal ExpectedProfitMargin { get; set; }
        public string ExpectedChangeDescription { get; set; }
        public string ExpectedChangeType { get; set; }

        public decimal ActualProfitMargin { get; set; }
        public string ActualChangeDescription { get; set; }
        public string ActualChangeType { get; set; }

        // Existing fields (legacy names)
        public string ChangeDescription { get; set; }
        public string ChangeType { get; set; }
    }
}
