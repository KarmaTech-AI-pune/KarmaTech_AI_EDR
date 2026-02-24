using System.Collections.Generic;

namespace EDR.Application.DTOs
{
    public class ManpowerPlanningDto
    {
        public ICollection<ManpowerDto>? Manpower { get; set; }
        public ManpowerTotalDto? ManpowerTotal { get; set; }
    }
}

