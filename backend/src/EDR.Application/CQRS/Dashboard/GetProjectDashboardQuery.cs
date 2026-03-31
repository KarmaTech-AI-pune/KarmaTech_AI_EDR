using MediatR;
using EDR.Application.Dtos.Dashboard;

namespace EDR.Application.CQRS.Dashboard
{
    public class GetProjectDashboardQuery : IRequest<ProjectDashboardDto>
    {
        public int ProjectId { get; set; }
    }
}
