using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.PMWorkflow.Commands
{
    public class SendToApprovalCommand : IRequest<PMWorkflowDto>
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; } // "ChangeControl" or "ProjectClosure"
        public string AssignedToId { get; set; } // RM/RD user ID
        public string Comments { get; set; }
    }
}
