using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.PMWorkflow.Commands
{
    public class RequestChangesCommand : IRequest<PMWorkflowDto>
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; } // "ChangeControl" or "ProjectClosure"
        public string Comments { get; set; }
        public bool IsApprovalChanges { get; set; } // true if RM/RD requesting changes, false if SPM
    }
}
