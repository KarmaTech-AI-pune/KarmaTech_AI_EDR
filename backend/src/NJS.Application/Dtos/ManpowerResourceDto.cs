using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    /// <summary>
    /// DTO for individual manpower resource with planned hours
    /// </summary>
    public class ManpowerResourceDto
    {
        /// <summary>
        /// Task identifier
        /// </summary>
        public string TaskId { get; set; } = string.Empty;

        /// <summary>
        /// Task title/name
        /// </summary>
        public string TaskTitle { get; set; } = string.Empty;

        /// <summary>
        /// Role identifier
        /// </summary>
        public string RoleId { get; set; } = string.Empty;

        /// <summary>
        /// Employee identifier
        /// </summary>
        public string EmployeeId { get; set; } = string.Empty;

        /// <summary>
        /// Employee name
        /// </summary>
        public string EmployeeName { get; set; } = string.Empty;

        /// <summary>
        /// Whether the employee is a consultant
        /// </summary>
        public bool IsConsultant { get; set; }

        /// <summary>
        /// Cost rate per hour
        /// </summary>
        public decimal CostRate { get; set; }

        /// <summary>
        /// Total hours allocated
        /// </summary>
        public decimal TotalHours { get; set; }

        /// <summary>
        /// Total cost calculated
        /// </summary>
        public decimal TotalCost { get; set; }

        /// <summary>
        /// Collection of planned hours by month/year
        /// </summary>
        public List<PlannedHourDto> PlannedHours { get; set; } = new List<PlannedHourDto>();
    }
}
