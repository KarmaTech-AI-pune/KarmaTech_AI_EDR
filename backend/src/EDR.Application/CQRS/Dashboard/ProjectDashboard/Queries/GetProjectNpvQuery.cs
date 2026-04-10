using MediatR;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries
{
    public class GetProjectNpvQuery : IRequest<ProjectNpvDto>
    {
        public int ProjectId { get; set; }
    }

    public class ProjectNpvDto
    {
        public decimal CurrentNpv { get; set; }
        public string WhatIfAnalysis { get; set; }
    }
}
