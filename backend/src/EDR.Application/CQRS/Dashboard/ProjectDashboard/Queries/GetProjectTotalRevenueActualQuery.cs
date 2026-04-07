using MediatR;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries
{
    public class GetProjectTotalRevenueActualQuery : IRequest<TotalRevenueActualDto>
    {
        public int ProjectId { get; set; }
    }

    public class TotalRevenueActualDto
    {
        public decimal TotalRevenue { get; set; }
        public string ChangeDescription { get; set; }
        public string ChangeType { get; set; }
    }
}
