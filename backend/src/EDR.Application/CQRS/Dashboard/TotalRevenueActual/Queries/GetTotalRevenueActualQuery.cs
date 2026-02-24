using MediatR;
using EDR.Application.DTOs.Dashboard;

namespace EDR.Application.CQRS.Dashboard.TotalRevenueActual.Queries
{
    public class GetTotalRevenueActualQuery : IRequest<TotalRevenueActualDto>
    {
    }
}

