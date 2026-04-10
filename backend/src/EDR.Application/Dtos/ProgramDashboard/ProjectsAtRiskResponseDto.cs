using System.Collections.Generic;

namespace EDR.Application.Dtos.ProgramDashboard
{
    public class ProjectsAtRiskResponseDto
    {
        public int CriticalCount { get; set; }
        public List<ProjectAtRiskDto> Projects { get; set; }
    }
}
