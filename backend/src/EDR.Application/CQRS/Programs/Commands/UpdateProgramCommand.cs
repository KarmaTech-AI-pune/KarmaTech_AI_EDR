using System;
using MediatR;

namespace EDR.Application.CQRS.Programs.Commands
{
    public class UpdateProgramCommand : IRequest<Unit> // Using Unit as we don't return a specific value on update
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}

