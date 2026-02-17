using System;

namespace EDR.Application.Dtos
{
    public class ProjectBudgetChangeHistoryDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public decimal OldValue { get; set; }
        public decimal NewValue { get; set; }
        public decimal Variance { get; set; }
        public decimal PercentageVariance { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string ChangedBy { get; set; } = string.Empty;
        public UserDto? ChangedByUser { get; set; }
        public DateTime ChangedDate { get; set; }
        public string? Reason { get; set; }
    }
}
