using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    /// <summary>
    /// DTO for WBS resource allocation data to be used in JobStartForm
    /// </summary>
    public class WBSResourceDataDto
    {
        public int ProjectId { get; set; }
        public List<WBSResourceAllocationDto> ResourceAllocations { get; set; } = new List<WBSResourceAllocationDto>();
    }

    /// <summary>
    /// DTO for individual resource allocation from WBS
    /// </summary>
    public class WBSResourceAllocationDto
    {
        public string TaskId { get; set; }
        public string TaskTitle { get; set; }
        public string RoleId { get; set; }
        public string EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public bool IsConsultant { get; set; }
        public decimal CostRate { get; set; }
        public decimal TotalHours { get; set; }
        public decimal TotalCost { get; set; }
        public decimal ODC { get; set; }
    }
}
