using MediatR;

namespace EDR.Application.CQRS.MonthlyProgress.Commands
{
    public class DeleteMonthlyProgressCommand : IRequest<bool>
    {
        public int Id { get; set; }
    }
}

