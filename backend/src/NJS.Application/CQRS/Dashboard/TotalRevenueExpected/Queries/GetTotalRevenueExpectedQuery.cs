using MediatR;
using NJS.Application.DTOs.Dashboard;

namespace NJS.Application.CQRS.Dashboard.TotalRevenueExpected.Queries
{
    public class GetTotalRevenueExpectedQuery : IRequest<TotalRevenueExpectedDto>
    {
    }
}
