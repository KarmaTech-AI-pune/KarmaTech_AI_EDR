using MediatR;
using NJS.Application.Dtos.Cashflow;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Cashflow.Commands
{
    public class CreatePaymentScheduleCommand : IRequest<List<PaymentScheduleItemDto>>
    {
        public int ProjectId { get; set; }
        public string ChangedBy { get; set; }
        public List<CreatePaymentScheduleItemDto> Milestones { get; set; }
    }
}