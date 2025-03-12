using System;
using System.Collections.Generic;
using NJS.Domain.Entities;

namespace NJS.Application.Dtos
{
    public class BidPreparationDto
    {
        public int Id { get; set; }       
        public int OpportunityId { get; set; }
        public string DocumentCategoriesJson { get; set; }
        public string UserId { get; set; }
        public int Version { get; set; }
        public BidPreparationStatus Status { get; set; }
        public string Comments { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public List<BidVersionHistoryDto> VersionHistory { get; set; }
    }

    public class BidVersionHistoryDto
    {
        public int Id { get; set; }
        public int BidPreparationId { get; set; }
        public int Version { get; set; }
        public string DocumentCategoriesJson { get; set; }
        public BidPreparationStatus Status { get; set; }        
        public string Comments { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
    }

    public class BidPreparationUpdateDto
    {
        public string DocumentCategoriesJson { get; set; }
        public int OpportunityId { get; set; }        
        public string Comments { get; set; }
    }

    public class BidPreparationApprovalDto
    {
        public int OpportunityId { get; set; }
        public bool IsApproved { get; set; }
        public string Comments { get; set; }
    }
}
