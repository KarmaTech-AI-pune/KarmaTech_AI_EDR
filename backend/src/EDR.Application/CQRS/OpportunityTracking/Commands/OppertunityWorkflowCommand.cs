using MediatR;
using EDR.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.OpportunityTracking.Commands
{
    public class OpportunityWorkflowCommand : IRequest<OpportunityTrackingDto>
    {
        public int OpportunityId { get; set; }
        public string? AssignedToId { get; set; }
        public string? Action { get; set; }// For BD manager only Send for Review
        public string? Comments { get; set; }
    }
    public class SendToApprovalCommand : IRequest<OpportunityTrackingDto>
    {
        public int OpportunityId { get; set; }
        public string? AssignedToId { get; set; }
        public string? Action { get; set; }// For BD manager only Send for Review
        public string? Comments { get; set; }
    }

    public class SendToApproveCommand : IRequest<OpportunityTrackingDto>
    {
        public int OpportunityId { get; set; }
        public string? AssignedToId { get; set; }
        public string? Action { get; set; }// For BD manager only Send for Review
        public string? Comments { get; set; }
    }
    public class SendToReviewCommand : IRequest<OpportunityTrackingDto>
    {
        public int OpportunityId { get; set; }
        public string? AssignedToId { get; set; }
        public string? Action { get; set; }// For BD manager only Send for Review
        public string? Comments { get; set; }
    }
}

