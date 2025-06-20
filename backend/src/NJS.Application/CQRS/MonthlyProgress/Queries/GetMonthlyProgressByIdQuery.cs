using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.MonthlyProgress.Queries
{
    public class GetMonthlyProgressByIdQuery : IRequest<MonthlyProgressDto>
    {
        public int Id { get; set; }
    }
}
