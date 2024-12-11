using System;

namespace NJS.Application.Dtos
{
    public class OpportunityHistoryDto
    {
        public int Id { get; set; }
        public int OpportunityId { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
    }
}
