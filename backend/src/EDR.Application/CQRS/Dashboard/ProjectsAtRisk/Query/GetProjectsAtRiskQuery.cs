using MediatR;
using EDR.Application.Dtos.Dashboard;

namespace EDR.Application.CQRS.Dashboard.ProjectsAtRisk.Query
{
    public class GetProjectsAtRiskQuery : IRequest<ProjectsAtRiskResponseDto>
    {
    }
}

