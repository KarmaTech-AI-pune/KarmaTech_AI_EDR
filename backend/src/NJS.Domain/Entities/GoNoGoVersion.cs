using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Enums;

namespace NJS.Domain.Entities
{
    public class GoNoGoVersion
    {
        [Key]
        public int Id { get; set; }
        
        public int GoNoGoDecisionHeaderId { get; set; }
        
        [ForeignKey("GoNoGoDecisionHeaderId")]
        public GoNoGoDecisionHeader GoNoGoDecisionHeader { get; set; }
        
        public int VersionNumber { get; set; }
        
        public string? FormData { get; set; } // JSON data of form state

        public GoNoGoVersionStatus Status { get; set; } // BDM_PENDING, BDM_APPROVED, RM_PENDING, RM_APPROVED, RD_PENDING, RD_APPROVED

        public string CreatedBy { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public string? ApprovedBy { get; set; }
        
        public DateTime? ApprovedAt { get; set; }
        
        public string? Comments { get; set; }
        public string? ActonBy {  get; set; }
    }
}
