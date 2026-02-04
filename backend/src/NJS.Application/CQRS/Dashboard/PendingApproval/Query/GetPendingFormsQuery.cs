using MediatR;
using NJS.Application.DTOs.Dashboard;

namespace NJS.Application.CQRS.Dashboard.PendingApproval.Query
{
    public class GetPendingFormsQuery : IRequest<PendingFormsResponseDto>
    {
    }
}
