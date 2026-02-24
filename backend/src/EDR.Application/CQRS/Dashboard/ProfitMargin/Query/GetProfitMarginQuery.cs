using MediatR;
using EDR.Application.Dtos.Dashboard;

namespace EDR.Application.CQRS.Dashboard.ProfitMargin.Query
{
    public class GetProfitMarginQuery : IRequest<ProfitMarginDto>
    {
    }
}

