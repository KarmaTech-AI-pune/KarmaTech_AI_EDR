using MediatR;
using EDR.Application.Dtos.ProjectDashboard;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries
{
    public class GetProjectExpectedProfitMarginQuery : IRequest<ProjectExpectedProfitMarginDto>
    {
        public int ProjectId { get; set; }
    }
}
