using System;
using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    /// <summary>
    /// Query to get manpower resources with monthly hours for a specific project
    /// </summary>
    public class GetManpowerResourcesWithMonthlyHoursQuery : IRequest<ManpowerResourcesWithMonthlyHoursDto>
    {
        /// <summary>
        /// The project identifier
        /// </summary>
        public int ProjectId { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="GetManpowerResourcesWithMonthlyHoursQuery"/> class.
        /// </summary>
        /// <param name="projectId">The project identifier.</param>
        /// <exception cref="ArgumentOutOfRangeException">Thrown when projectId is less than or equal to 0.</exception>
        public GetManpowerResourcesWithMonthlyHoursQuery(int projectId)
        {
            if (projectId <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(projectId), "Project ID must be greater than zero.");
            }
            
            ProjectId = projectId;
        }
    }
}
