using System;

namespace NJS.Application.Dtos
{
    public class OpportunityHistoryDto
    {
        public int Id { get; set; }
        public int OpportunityId { get; set; }
        public DateTime ActionDate { get; set; }
        public string Comments { get; set; }
        public string Status { get; set; }
        public string Action {  get; set; }
    }
}
