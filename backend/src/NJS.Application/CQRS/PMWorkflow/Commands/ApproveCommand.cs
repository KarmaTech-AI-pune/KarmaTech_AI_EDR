using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.PMWorkflow.Commands
{
    public class ApproveCommand : IRequest<PMWorkflowDto>
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; } // "ChangeControl" or "ProjectClosure"
        public string Comments { get; set; }
    }
}
