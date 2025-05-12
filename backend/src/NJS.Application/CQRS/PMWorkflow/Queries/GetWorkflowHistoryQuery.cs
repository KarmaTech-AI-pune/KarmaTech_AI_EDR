using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.PMWorkflow.Queries
{
    public class GetWorkflowHistoryQuery : IRequest<PMWorkflowHistoryDto>
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; } // "ChangeControl" or "ProjectClosure"
    }
}
