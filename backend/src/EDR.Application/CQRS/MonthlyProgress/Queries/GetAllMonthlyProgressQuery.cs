using MediatR;
using EDR.Application.DTOs;
using System.Collections.Generic;

namespace EDR.Application.CQRS.MonthlyProgress.Queries
{
    public class GetAllMonthlyProgressQuery : IRequest<List<MonthlyProgressDto>>
    {
    }
}

