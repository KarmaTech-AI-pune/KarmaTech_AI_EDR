using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    /// <summary>
    /// DTO for manpower resources with planned hours data
    /// </summary>
    public class ManpowerResourcesWithPlannedHoursDto
    {
        /// <summary>
        /// Project identifier
        /// </summary>
        public int ProjectId { get; set; }

        /// <summary>
        /// Collection of manpower resources with their planned hours
        /// </summary>
        public IReadOnlyCollection<ManpowerResourceDto> Resources { get; set; } = Array.Empty<ManpowerResourceDto>();
    }
}
