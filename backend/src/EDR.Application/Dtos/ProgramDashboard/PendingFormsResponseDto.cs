using System.Collections.Generic;

namespace EDR.Application.Dtos.ProgramDashboard
{
    public class PendingFormsResponseDto
    {
        public int TotalPendingForms { get; set; }
        public List<PendingFormDto> PendingForms { get; set; }
    }
}
