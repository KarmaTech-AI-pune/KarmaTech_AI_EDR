using System.Collections.Generic;

namespace EDR.Application.Dtos.ProjectDashboard
{
    public class PendingFormsResponseDto
    {
        public int TotalPendingForms { get; set; }
        public List<PendingFormDto> PendingForms { get; set; }
    }
}
