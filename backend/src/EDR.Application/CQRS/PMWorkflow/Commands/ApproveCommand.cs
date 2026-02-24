using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.PMWorkflow.Commands
{
    public class ApproveCommand : IRequest<PMWorkflowDto>
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; } // "ChangeControl" or "ProjectClosure"       
        public string AssignedToId { get; set; } // RM/RD user ID
        public string Comments { get; set; }
        public string Action { get; set; }
    }
}

