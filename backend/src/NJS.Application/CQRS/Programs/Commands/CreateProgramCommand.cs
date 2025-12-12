using System;
using MediatR;

namespace NJS.Application.CQRS.Programs.Commands
{
    public class CreateProgramCommand : IRequest<int>
    {
        public int TenantId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? CreatedBy { get; set; }
    }
}
