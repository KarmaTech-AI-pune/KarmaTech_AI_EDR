using Swashbuckle.AspNetCore.Filters;
using NJS.Application.Dtos;
using System;

namespace NJSAPI.Examples
{
    public class SprintPlanInputDtoExample : IExamplesProvider<SprintPlanInputDto>
    {
        public SprintPlanInputDto GetExamples()
        {
            return new SprintPlanInputDto
            {
                SprintId = 1,
                TenantId = 1,
                StartDate = DateTime.Parse("2025-11-01T09:00:00Z"),
                EndDate = DateTime.Parse("2025-11-15T17:00:00Z"),
                SprintGoal = "string",
                ProjectId = 1,
                RequiredSprintEmployees = 10
            };
        }
    }
}
