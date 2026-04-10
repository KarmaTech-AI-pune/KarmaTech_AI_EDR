using MediatR;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries
{
    public class GetProjectTotalRevenueExpectedQuery : IRequest<TotalRevenueExpectedDto>
    {
        public int ProjectId { get; set; }
    }

    public class TotalRevenueExpectedDto
    {
        public decimal TotalRevenue { get; set; }
        public string ChangeDescription { get; set; }
        public string ChangeType { get; set; }
    }
}
