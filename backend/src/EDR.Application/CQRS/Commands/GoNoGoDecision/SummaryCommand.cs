using EDR.Domain.Enums;

namespace EDR.Application.CQRS.Commands.GoNoGoDecision
{
    public class SummaryCommand
    {
        public int TotalScore { get; set; }
        public GoNoGoStatus Status { get; set; }
        public string DecisionComments { get; set; }
        public string ActionPlan { get; set; }
    }
}

