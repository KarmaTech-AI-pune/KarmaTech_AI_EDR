using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.MonthlyProgress.Commands
{
    public class CreateMonthlyProgressCommand : IRequest<int>
    {
        public int ProjectId { get; set; }
        public CreateMonthlyProgressDto MonthlyProgress { get; set; }
    }
}
