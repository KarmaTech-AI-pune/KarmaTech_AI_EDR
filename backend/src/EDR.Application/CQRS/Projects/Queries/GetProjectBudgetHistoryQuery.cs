using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Projects.Queries{
    public record GetProjectBudgetHistoryQuery : IRequest<ProjectBudgetHistoryResponseDto>
    {
        public int ProjectId { get; init; }
        public string? FieldName { get; init; } // Optional filter for "EstimatedProjectCost" or "EstimatedProjectFee"
        public int PageNumber { get; init; } = 1;
        public int PageSize { get; init; } = 10;
    }
}
