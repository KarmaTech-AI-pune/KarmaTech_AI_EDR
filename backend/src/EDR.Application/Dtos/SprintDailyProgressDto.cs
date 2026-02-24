using System;

namespace EDR.Application.Dtos
{
    public class SprintDailyProgressDto
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
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
    }
}

