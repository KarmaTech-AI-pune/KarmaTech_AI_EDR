using MediatR;

namespace NJS.Application.CQRS.Commands.GoNoGoDecision
{
    public class CreateGoNoGoDecisionHeaderCommand : IRequest<int>
    {
        public HeaderInfoCommand HeaderInfo { get; set; }
        public MetaDataCommand MetaData { get; set; }
        public ScoringCriteriaCommand ScoringCriteria { get; set; }
        public SummaryCommand Summary { get; set; }
    }
}
