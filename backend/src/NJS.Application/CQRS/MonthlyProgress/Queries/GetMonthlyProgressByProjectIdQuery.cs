using MediatR;
using NJS.Application.DTOs;
using System.Collections.Generic;

namespace NJS.Application.CQRS.MonthlyProgress.Queries
{
    public class GetMonthlyProgressByProjectIdQuery : IRequest<List<MonthlyProgressDto>>
    {
        public int ProjectId { get; set; }
    }
}
