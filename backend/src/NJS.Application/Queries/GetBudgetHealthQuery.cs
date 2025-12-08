using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.Queries
{
    public class GetBudgetHealthQuery : IRequest<BudgetHealthDto>
    {
        public int ProjectId { get; set; }
    }
}
