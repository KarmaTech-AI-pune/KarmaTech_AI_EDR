using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class MonthlyBudgetResponseDto
    {
        public string ProjectName { get; set; }
        public List<CashflowDto> Cashflows { get; set; }
        public MonthlyBudgetSummaryDto Summary { get; set; }
    }
}
