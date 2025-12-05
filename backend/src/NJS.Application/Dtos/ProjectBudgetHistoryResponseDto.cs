using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class ProjectBudgetHistoryResponseDto
    {
        public List<ProjectBudgetChangeHistoryDto> History { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)System.Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNext => PageNumber < TotalPages;
        public bool HasPrevious => PageNumber > 1;
    }
}