using MediatR;
using EDR.Application.DTOs;
using System.Collections.Generic;

namespace EDR.Application.CQRS.MonthlyProgress.Queries
{
    public class GetMonthlyProgressByProjectIdQuery : IRequest<List<MonthlyProgressDto>>
    {
        public int ProjectId { get; set; }
    }
}

