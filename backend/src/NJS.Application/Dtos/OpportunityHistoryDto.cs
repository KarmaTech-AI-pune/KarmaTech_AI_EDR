using System;
using NJS.Domain.Enums;

namespace NJS.Application.Dtos
{
    public class OpportunityHistoryDto
    {
        public int Id { get; set; }
        public int OpportunityId { get; set; }
        public string ActionBy { get; set; }
        public int StatusId { get; set; }
        public string Comments { get; set; }
        public DateTime ActionDate { get; set; }
        public OpportunityTrackingStatus Status { get; set; }
    }
}
