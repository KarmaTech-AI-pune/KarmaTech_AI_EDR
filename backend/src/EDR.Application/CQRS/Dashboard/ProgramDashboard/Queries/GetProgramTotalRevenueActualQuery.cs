using MediatR;
using EDR.Application.Dtos.ProgramDashboard;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries
{
    public class GetProgramTotalRevenueActualQuery : IRequest<TotalRevenueActualDto>
    {
        public int ProgramId { get; set; }
    }
}
