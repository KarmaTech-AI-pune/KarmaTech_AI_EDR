using MediatR;
using System;

namespace NJS.Application.CQRS.Projects.Commands
{
    public record CreateFeasibilityStudyCommand : IRequest<int>
    {
        public int ProjectId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Methodology { get; set; }
        public string Findings { get; set; }
        public string Recommendations { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
