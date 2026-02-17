using MediatR;
using EDR.Application.Dtos.Dashboard;

namespace EDR.Application.CQRS.Dashboard.RevenueAtRisk.Query
{
    public class GetRevenueAtRiskQuery : IRequest<RevenueAtRiskDto>
    {
    }
}

