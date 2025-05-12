using NJS.Domain.Entities;
using System;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.Dtos
{
    public class ChangeControlDto
    {
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        public int SrNo { get; set; }

        [Required]
        public DateTime DateLogged { get; set; }

        [Required]
        [StringLength(100)]
        public string Originator { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        public string CostImpact { get; set; }
        public string TimeImpact { get; set; }
        public string ResourcesImpact { get; set; }
        public string QualityImpact { get; set; }
        public string ChangeOrderStatus { get; set; }
        public string ClientApprovalStatus { get; set; }
        public string ClaimSituation { get; set; }

        // Audit fields - these will be set in the backend
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "System";
        public string UpdatedBy { get; set; } = "System";
        public ChangeControlWorkflowHistoryDto? WorkflowHistory { get; set; }
    }
}
