using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NJS.Application.Dtos
{
    /// <summary>
    /// DTO for manpower resources with monthly hours data
    /// </summary>
    public class ManpowerResourcesWithMonthlyHoursDto
    {
        /// <summary>
        /// The project identifier
        /// </summary>
        public int ProjectId { get; set; }
        
        /// <summary>
        /// Collection of manpower resources with their monthly hours
        /// </summary>
        public IReadOnlyCollection<ManpowerResourceDto> Resources { get; set; } = Array.Empty<ManpowerResourceDto>();
    }

    /// <summary>
    /// DTO for individual manpower resource with monthly hours
    /// </summary>
    public class ManpowerResourceDto
    {
        /// <summary>
        /// The task identifier
        /// </summary>
        public string TaskId { get; set; }
        
        /// <summary>
        /// The title of the task
        /// </summary>
        public string TaskTitle { get; set; }
        
        /// <summary>
        /// The role identifier for the resource
        /// </summary>
        public string RoleId { get; set; }
        
        /// <summary>
        /// The employee identifier
        /// </summary>
        public string EmployeeId { get; set; }
        
        /// <summary>
        /// The name of the employee
        /// </summary>
        public string EmployeeName { get; set; }
        
        /// <summary>
        /// Indicates whether the resource is a consultant
        /// </summary>
        public bool IsConsultant { get; set; }
        
        /// <summary>
        /// The cost rate for the resource
        /// </summary>
        public decimal CostRate { get; set; }
        
        /// <summary>
        /// The total hours allocated to this resource
        /// </summary>
        public decimal TotalHours { get; set; }
        
        /// <summary>
        /// The total cost for this resource
        /// </summary>
        public decimal TotalCost { get; set; }
        
        /// <summary>
        /// Collection of monthly hour allocations
        /// </summary>
        public IReadOnlyCollection<MonthlyHourDto> MonthlyHours { get; set; } = Array.Empty<MonthlyHourDto>();
    }
}
