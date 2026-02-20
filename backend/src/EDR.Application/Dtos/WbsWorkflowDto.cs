using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.Dtos
{
    public record WbsWorkflowDto
    {
        public int Id { get; set; }
        public string Status { get; set; }
        public int ? StatusId { get; set; }
    }
}

