using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.PMWorkflow.Queries
{
    public class GetWorkflowHistoryQuery : IRequest<PMWorkflowHistoryDto>
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; } // "ChangeControl" or "ProjectClosure"
    }
}

