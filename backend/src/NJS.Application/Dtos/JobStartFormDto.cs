using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.Dtos
{
    public class JobStartFormDto
    {
        public int FormId { get; set; }
        
        [Required(ErrorMessage = "Project ID is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Project ID must be greater than 0")]
        public int ProjectId { get; set; }
        
        public int? WorkBreakdownStructureId { get; set; }
        
        [Required(ErrorMessage = "Form title is required")]
        public string? FormTitle { get; set; }
        
        [Required(ErrorMessage = "Description is required")]
        public string? Description { get; set; }
        
        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }
        
        [Required(ErrorMessage = "Prepared by is required")]
        public string? PreparedBy { get; set; }
        
        [Required(ErrorMessage = "Created date is required")]
        public DateTime CreatedDate { get; set; }
        
        public DateTime? UpdatedDate { get; set; }

        // Financial data fields
        [Range(0, double.MaxValue, ErrorMessage = "Total time cost cannot be negative")]
        public decimal TotalTimeCost { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Total expenses cannot be negative")]
        public decimal TotalExpenses { get; set; }
        
        [Range(0, 100, ErrorMessage = "Service tax percentage must be between 0 and 100")]
        public decimal ServiceTaxPercentage { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Service tax amount cannot be negative")]
        public decimal ServiceTaxAmount { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Grand total cannot be negative")]
        public decimal GrandTotal { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Project fees cannot be negative")]
        public decimal ProjectFees { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Total project fees cannot be negative")]
        public decimal TotalProjectFees { get; set; }
        
        [Range(double.MinValue, double.MaxValue, ErrorMessage = "Profit must be a valid number")]
        public decimal Profit { get; set; }
        
        [Range(0, 100, ErrorMessage = "Profit percentage must be between 0 and 100")]
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
