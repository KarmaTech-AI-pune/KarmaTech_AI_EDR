using MediatR;
using EDR.Application.DTOs.Dashboard;

namespace EDR.Application.CQRS.Dashboard.TotalRevenueExpected.Queries
{
    public class GetTotalRevenueExpectedQuery : IRequest<TotalRevenueExpectedDto>
    {
    }
}

