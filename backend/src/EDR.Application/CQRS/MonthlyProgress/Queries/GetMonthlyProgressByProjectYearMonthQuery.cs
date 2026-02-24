using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.MonthlyProgress.Queries
{
    public class GetMonthlyProgressByProjectYearMonthQuery : IRequest<MonthlyProgressDto>
    {
        public int ProjectId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
    }
}

