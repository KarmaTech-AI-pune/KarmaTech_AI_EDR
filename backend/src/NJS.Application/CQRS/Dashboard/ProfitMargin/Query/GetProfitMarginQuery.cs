using MediatR;
using NJS.Application.Dtos.Dashboard;

namespace NJS.Application.CQRS.Dashboard.ProfitMargin.Query
{
    public class GetProfitMarginQuery : IRequest<ProfitMarginDto>
    {
    }
}
