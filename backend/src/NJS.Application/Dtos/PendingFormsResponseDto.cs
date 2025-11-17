using System.Collections.Generic;

namespace NJS.Application.DTOs
{
    public class PendingFormsResponseDto
    {
        public int TotalPendingForms { get; set; }
        public List<PendingFormDto> PendingForms { get; set; } = new List<PendingFormDto>();
    }
}
