using System;

namespace NJS.Application.Dtos
{
    public class BidPreparationDto
    {
        public int Id { get; set; }
        public string DocumentCategoriesJson { get; set; }
        public int OpportunityId { get; set; }
        public string UserId { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
    }
}
