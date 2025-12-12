using MediatR;
using NJS.Application.Dtos.Dashboard;

namespace NJS.Application.CQRS.Dashboard.ProjectsAtRisk.Query
{
    public class GetProjectsAtRiskQuery : IRequest<ProjectsAtRiskResponseDto>
    {
    }
}
