using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class PMWorkflowHistoryDto
    {
        public int EntityId { get; set; }
        public string EntityType { get; set; }
        public int CurrentStatusId { get; set; }
        public string CurrentStatus { get; set; }
        public List<PMWorkflowDto> History { get; set; } = new List<PMWorkflowDto>();
    }
}
