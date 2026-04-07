using System.Collections.Generic;
using EDR.Application.Dtos.Dashboard;
using MediatR;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Queries
{
    public class GetTaskPriorityMatrixQuery : IRequest<List<TaskPriorityItemDto>>
    {
    }
}
