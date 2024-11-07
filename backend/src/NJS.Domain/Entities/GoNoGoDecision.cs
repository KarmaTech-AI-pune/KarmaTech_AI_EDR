//File: backend/src/NJS.Domain/Entities/GoNoGoDecision.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
{
    public class GoNoGoDecision
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public bool Decision { get; set; }
        public string Rationale { get; set; }
        public DateTime DecisionDate { get; set; }
        public string DecisionMaker { get; set; }

        public Project Project { get; set; }
    }
}
