using MediatR;
using EDR.Application.Dtos.Dashboard;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Queries
{
    public class GetPendingFormsQuery : IRequest<PendingFormsResponseDto>
    {
    }
}

