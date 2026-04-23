using System.Collections.Generic;
using MediatR;
using EDR.Application.Dtos.ProgramDashboard;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries
{
    public class GetProgramProjectsAtRiskQuery : IRequest<List<ProjectAtRiskDto>>
    {
        public int ProgramId { get; set; }
    }
}
