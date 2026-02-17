namespace EDR.Application.Dtos.Dashboard
{
    public class RegionalPortfolioDto
    {
        public string Region { get; set; }
        public int Q1 { get; set; }
        public int Q2 { get; set; }
        public int Q3 { get; set; }
        public int Q4 { get; set; }
        public decimal Revenue { get; set; }
        public decimal Profit { get; set; }
    }
}

