using MediatR;
using EDR.Application.Dtos;
using System;

namespace EDR.Application.CQRS.SprintDailyProgresses.Commands
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

