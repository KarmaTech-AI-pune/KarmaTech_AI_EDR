using MediatR;
using NJS.Application.DTOs.Dashboard;

namespace NJS.Application.CQRS.Dashboard.TotalRevenueActual.Queries
{
    public class GetTotalRevenueActualQuery : IRequest<TotalRevenueActualDto>
    {
    }
}
