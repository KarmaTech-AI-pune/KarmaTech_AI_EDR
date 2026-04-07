using MediatR;
using EDR.Application.Dtos.ProgramDashboard;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries
{
    public class GetProgramNpvQuery : IRequest<ProgramNpvDto>
    {
        public int ProgramId { get; set; }
    }
}
