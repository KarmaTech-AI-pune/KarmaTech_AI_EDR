using MediatR;
using NJS.Application.Dtos;
using System;

namespace NJS.Application.CQRS.SprintDailyProgresses.Commands
{
    public class CreateSprintDailyProgressCommand : IRequest<SprintDailyProgressDto>
    {
        public int TenantId { get; set; }
        public int SprintPlanId { get; set; }
        public DateTime Date { get; set; }
        public int PlannedStoryPoints { get; set; }
        public int CompletedStoryPoints { get; set; }
        public int RemainingStoryPoints { get; set; }
        public int AddedStoryPoints { get; set; }
        public int IdealRemainingPoints { get; set; }
        public string CreatedBy { get; set; }
    }
}
