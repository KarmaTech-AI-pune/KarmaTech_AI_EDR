using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace EDR.Application.Dtos
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
        [Range(0, double.MaxValue)]
        public decimal TotalTimeCost { get; set; }
        [Range(0, double.MaxValue)]
        public decimal TotalExpenses { get; set; }
        [Range(0, double.MaxValue)]
        public decimal ServiceTaxPercentage { get; set; }
        [Range(0, double.MaxValue)]
        public decimal ServiceTaxAmount { get; set; }
        [Range(0, double.MaxValue)]
        public decimal GrandTotal { get; set; }
        [Range(0, double.MaxValue)]
        public decimal ProjectFees { get; set; }
        [Range(0, double.MaxValue)]
        public decimal TotalProjectFees { get; set; }
        [Range(0, double.MaxValue)]
        public decimal Profit { get; set; }
        [Range(0, 100)]
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

