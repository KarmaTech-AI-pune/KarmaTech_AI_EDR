using MediatR;
using EDR.Application.Dtos.Dashboard;

namespace EDR.Application.CQRS.Dashboard.PendingApproval.Query
{
    public class GetPendingFormsQuery : IRequest<PendingFormsResponseDto>
    {
    }
}

