using MediatR;
using EDR.Application.Dtos.ProgramDashboard;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries
{
    public class GetProgramDashboardQuery : IRequest<ProgramDashboardDto>
    {
        public int ProgramId { get; set; }
    }
}
