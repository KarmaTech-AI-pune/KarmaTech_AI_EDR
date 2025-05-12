using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.Dtos
{
    public class WorkflowActionContext    {
      
        public int EntityId { get; set; }
        public string Action { get; set; } // "Approve", "Review", "Reject", etc.
        public string Comments { get; set; }
        public string AssignedToId { get; set; }

        public User CurrentUser { get; set; }
        public User AssignedToUser { get; set; }
    }
}
