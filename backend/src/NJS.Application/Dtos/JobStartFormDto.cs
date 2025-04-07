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

        // New properties to match frontend interface
        public TimeDataDto Time { get; set; }
        public ExpensesDataDto Expenses { get; set; }
        public decimal GrandTotal { get; set; }
        public decimal ProjectFees { get; set; }
        public ServiceTaxDataDto ServiceTax { get; set; }
        public decimal TotalProjectFees { get; set; }
        public decimal Profit { get; set; }

        public List<JobStartFormSelectionDto> Selections { get; set; } = new List<JobStartFormSelectionDto>();
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
