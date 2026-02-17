using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.MonthlyProgress.Commands
{
    public class UpdateMonthlyProgressCommand : IRequest<bool>
    {
        public int Id { get; set; }
        public CreateMonthlyProgressDto MonthlyProgress { get; set; }
    }
}

