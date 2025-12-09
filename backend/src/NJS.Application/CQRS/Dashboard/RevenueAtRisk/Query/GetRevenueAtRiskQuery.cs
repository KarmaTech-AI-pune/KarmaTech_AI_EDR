using MediatR;
using NJS.Application.Dtos.Dashboard;

namespace NJS.Application.CQRS.Dashboard.RevenueAtRisk.Query
{
    public class GetRevenueAtRiskQuery : IRequest<RevenueAtRiskDto>
    {
    }
}
