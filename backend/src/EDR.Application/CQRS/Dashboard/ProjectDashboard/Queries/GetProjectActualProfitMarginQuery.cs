using MediatR;
using EDR.Application.Dtos.ProjectDashboard;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries
{
    public class GetProjectActualProfitMarginQuery : IRequest<ProjectActualProfitMarginDto>
    {
        public int ProjectId { get; set; }
    }
}
