using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class BidPreparation :IAuditableEntity
    {
        public int Id { get; set; }
        public string DocumentCategoriesJson { get; set; }
        public int OpportunityId { get; set; }
        [ForeignKey("OpportunityId")]
        public OpportunityTracking OpportunityTracking { get; set; }
        public string UserId { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set ; }
        public string UpdatedBy { get; set ; }
    }
}
