using EDR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.Dtos
{
    public class WorkflowActionContext    {

        public int EntityId { get; set; }
        public string Action { get; set; } // "Approve", "Review", "Reject", etc.
        public string Comments { get; set; }
        public string AssignedToId { get; set; }
        public bool IsApprovalChanges { get; set; } // Indicates if this is an RM/RD rejection

        public User CurrentUser { get; set; }
        public User? AssignedToUser { get; set; }
    }
}

