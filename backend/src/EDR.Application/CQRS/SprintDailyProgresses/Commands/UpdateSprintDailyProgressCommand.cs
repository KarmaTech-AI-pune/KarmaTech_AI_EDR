using MediatR;
using EDR.Application.Dtos;
using System;

namespace EDR.Application.CQRS.SprintDailyProgresses.Commands
{
    public class UpdateSprintDailyProgressCommand : IRequest<SprintDailyProgressDto>
    {
        public int DailyProgressId { get; set; }
        public int TenantId { get; set; }
        public int SprintPlanId { get; set; }
        public DateTime Date { get; set; }
        public int PlannedStoryPoints { get; set; }
        public int CompletedStoryPoints { get; set; }
        public int RemainingStoryPoints { get; set; }
        public int AddedStoryPoints { get; set; }
        public int IdealRemainingPoints { get; set; }
        public string UpdatedBy { get; set; }
    }
}

