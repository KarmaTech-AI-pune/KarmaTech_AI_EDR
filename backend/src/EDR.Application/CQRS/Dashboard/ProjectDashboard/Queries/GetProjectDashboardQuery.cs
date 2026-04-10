using MediatR;
using EDR.Application.Dtos.ProjectDashboard;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries
{
    public class GetProjectDashboardQuery : IRequest<ProjectDashboardDto>
    {
        public int ProjectId { get; set; }
    }
}
