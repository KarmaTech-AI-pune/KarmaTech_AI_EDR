using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class JobStartFormDto
    {
        public int FormId { get; set; }
        public int ProjectId { get; set; }
        public int? WorkBreakdownStructureId { get; set; }
        public string? FormTitle { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public string? PreparedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // Financial data fields
        public decimal TotalTimeCost { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal ServiceTaxPercentage { get; set; }
        public decimal ServiceTaxAmount { get; set; }
        public decimal GrandTotal { get; set; }
        public decimal ProjectFees { get; set; }
        public decimal TotalProjectFees { get; set; }
        public decimal Profit { get; set; }
        public decimal ProfitPercentage { get; set; }

        public List<JobStartFormSelectionDto> Selections { get; set; } = new List<JobStartFormSelectionDto>();

        // Resources for Time and Expenses
        public List<JobStartFormResourceDto> Resources { get; set; } = new List<JobStartFormResourceDto>();
    }

    public class JobStartFormSelectionDto
    {
        public int SelectionId { get; set; }
        public int FormId { get; set; }
        public string OptionCategory { get; set; }
        public string OptionName { get; set; }
        public bool IsSelected { get; set; }
        public string Notes { get; set; }
    }
}
