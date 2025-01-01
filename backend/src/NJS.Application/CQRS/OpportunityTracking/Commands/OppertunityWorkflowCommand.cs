using MediatR;
using NJS.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.OpportunityTracking.Commands
{
    public class OppertunityWorkflowCommand : IRequest<OppertunityWorkflowDto>
    {
        public int OppertunityId { get; set; }
        public string AssignedToId { get; set; }
        public string Action { get; set; }// For BD manager only Send for Review
        public string Commnets { get; set; }
    }
}
