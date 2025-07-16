using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.MonthlyProgress.Commands
{
    public class UpdateMonthlyProgressCommand : IRequest<bool>
    {
        public int Id { get; set; }
        public CreateMonthlyProgressDto MonthlyProgress { get; set; }
    }
}
