using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.PMWorkflow.Commands
{
    public class RequestChangesCommand : IRequest<PMWorkflowDto>
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; } // "ChangeControl", "ProjectClosure", or "WBS"
        public string AssignedToId { get; set; } // User ID to assign to (SPM when RM/RD rejects)
        public string Comments { get; set; }
        public string Action { get; set; } // "Reject" or "Approval Changes"
        public bool? IsApprovalChanges { get; set; } // true if RM/RD requesting changes, false if SPM
    }
}

