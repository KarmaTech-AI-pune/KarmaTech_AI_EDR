using MediatR;
using EDR.Application.Dtos.Dashboard;

namespace EDR.Application.CQRS.Dashboard
{
    public class GetProgramDashboardQuery : IRequest<ProgramDashboardDto>
    {
        public int ProgramId { get; set; }
    }
}
