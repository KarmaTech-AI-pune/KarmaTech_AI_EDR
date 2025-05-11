using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.PMWorkflow.Commands
{
    public class RequestChangesCommand : IRequest<PMWorkflowDto>
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; } // "ChangeControl" or "ProjectClosure"
        public string AssignedToId { get; set; } // RM/RD user ID
        public string Comments { get; set; }
        public string Action { get; set; }
        public bool? IsApprovalChanges { get; set; } // true if RM/RD requesting changes, false if SPM
    }
}
