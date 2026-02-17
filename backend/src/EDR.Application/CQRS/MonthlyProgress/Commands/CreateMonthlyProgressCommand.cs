using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.MonthlyProgress.Commands
{
    public class CreateMonthlyProgressCommand : IRequest<int>
    {
        public int ProjectId { get; set; }
        public CreateMonthlyProgressDto MonthlyProgress { get; set; }
    }
}

