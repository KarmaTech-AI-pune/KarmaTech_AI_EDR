using MediatR;
using EDR.Application.Dtos.Dashboard;

namespace EDR.Application.CQRS.Dashboard.TotalRevenueActual.Queries
{
    public class GetTotalRevenueActualQuery : IRequest<TotalRevenueActualDto>
    {
    }
}

