using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Projects.Commands
{
    public record UpdateProjectBudgetCommand : IRequest<ProjectBudgetUpdateResultDto>
    {
        public int ProjectId { get; init; }
        public decimal? EstimatedProjectCost { get; init; }
        public decimal? EstimatedProjectFee { get; init; }
        public string? Reason { get; init; }
        public string ChangedBy { get; init; } = string.Empty;
    }
}
