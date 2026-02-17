using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class ProjectBudgetUpdateResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<ProjectBudgetChangeHistoryDto> CreatedHistoryRecords { get; set; } = new();
    }
}
