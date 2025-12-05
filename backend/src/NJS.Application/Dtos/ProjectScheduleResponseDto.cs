namespace NJS.Application.Dtos
{
    public class ProjectScheduleResponseDto
    {
        public SprintPlanDto? Data { get; set; }
        public string? AccessLink { get; set; }
        public int? ProjectId { get; set; }
        public string? Message { get; set; }
    }
}
