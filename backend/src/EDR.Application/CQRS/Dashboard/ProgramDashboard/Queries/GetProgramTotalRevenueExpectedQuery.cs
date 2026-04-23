using MediatR;
using EDR.Application.Dtos.ProgramDashboard;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries
{
    public class GetProgramTotalRevenueExpectedQuery : IRequest<TotalRevenueExpectedDto>
    {
        public int ProgramId { get; set; }
    }
}
