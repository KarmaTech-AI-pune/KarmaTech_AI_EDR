using MediatR;
using NJS.Application.Dtos;
using System;

namespace NJS.Application.CQRS.SprintDailyProgresses.Commands
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
