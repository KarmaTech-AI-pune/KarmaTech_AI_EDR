namespace EDR.Application.Dtos
{
    public class MonthlyBudgetSummaryDto
    {
        public decimal PureManpowerCost { get; set; }
        public decimal OtherODC { get; set; }
        public decimal Total { get; set; }
        public ContingencyDto ManpowerContingencies { get; set; }
        public ContingencyDto OdcContingencies { get; set; }
        public decimal SubTotal { get; set; }
        public ContingencyDto Profit { get; set; }
        public decimal TotalProjectCost { get; set; }
        public ContingencyDto GST { get; set; }
        public decimal QuotedPrice { get; set; }
    }
    
    public class ContingencyDto
    {
        public int Percentage { get; set; }
        public decimal Amount { get; set; }
    }
}
