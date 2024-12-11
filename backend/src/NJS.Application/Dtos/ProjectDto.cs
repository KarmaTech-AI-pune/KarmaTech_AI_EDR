using System;
using NJS.Domain.Entities;

namespace NJS.Application.Dtos
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ClientName { get; set; }
        public string ClientSector { get; set; }
        public string Sector { get; set; }
        public decimal EstimatedCost { get; set; }
        public decimal? CapitalValue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public ProjectStatus Status { get; set; }
        public int Progress { get; set; }
        public int? DurationInMonths { get; set; }
        public string FundingStream { get; set; }
        public string ContractType { get; set; }
        public string Currency { get; set; }
        public string ProjectManagerId { get; set; }
        public string RegionalManagerId { get; set; }
        public string SeniorProjectManagerId { get; set; }
        
        // Audit fields will be set by the handler
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string LastModifiedBy { get; set; }
    }
}
