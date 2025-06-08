using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.Dtos
{
    public record WbsWorkflowDto
    {
        public int Id { get; set; }
        public string Status { get; set; }
        public int ? StatusId { get; set; }
    }
}
