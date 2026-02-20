using System;
using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class JobStartFormHeaderDto
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public int ProjectId { get; set; }
        public int StatusId { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        
        // Navigation property for workflow history
        public List<JobStartFormHistoryDto> JobStartFormHistories { get; set; } = new List<JobStartFormHistoryDto>();
    }
}

