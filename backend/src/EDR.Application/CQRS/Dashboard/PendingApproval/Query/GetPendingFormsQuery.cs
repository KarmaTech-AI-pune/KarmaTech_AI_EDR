using MediatR;
using EDR.Application.DTOs.Dashboard;

namespace EDR.Application.CQRS.Dashboard.PendingApproval.Query
{
    public class GetPendingFormsQuery : IRequest<PendingFormsResponseDto>
    {
    }
}

