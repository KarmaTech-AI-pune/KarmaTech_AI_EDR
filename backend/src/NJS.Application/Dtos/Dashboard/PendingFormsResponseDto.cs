using System.Collections.Generic;

namespace NJS.Application.DTOs.Dashboard
{
    public class PendingFormsResponseDto
    {
        public int TotalPendingForms { get; set; }
        public List<PendingFormDto> PendingForms { get; set; }
    }
}
