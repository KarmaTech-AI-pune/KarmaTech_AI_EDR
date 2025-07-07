using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.MonthlyProgress.Queries
{
    public class GetMonthlyProgressByProjectYearMonthQuery : IRequest<MonthlyProgressDto>
    {
        public int ProjectId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
    }
}
