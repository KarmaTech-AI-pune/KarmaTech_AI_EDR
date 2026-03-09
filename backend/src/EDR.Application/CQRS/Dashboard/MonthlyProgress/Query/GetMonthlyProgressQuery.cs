using MediatR;
using EDR.Application.Dtos.Dashboard;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Dashboard.MonthlyProgress.Query
{
    public class GetMonthlyProgressQuery : IRequest<List<MonthlyAssigneeProgressDto>>
    {
        public int ProjectId { get; set; }
    }
}
