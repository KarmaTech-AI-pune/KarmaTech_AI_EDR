using MediatR;
using EDR.Application.Dtos.ProgramDashboard;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries
{
    public class GetProgramProfitMarginQuery : IRequest<ProgramProfitMarginDto>
    {
        public int ProgramId { get; set; }
    }
}
