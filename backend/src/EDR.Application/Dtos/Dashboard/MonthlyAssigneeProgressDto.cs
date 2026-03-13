using System;

namespace EDR.Application.Dtos.Dashboard
{
    public class MonthlyAssigneeProgressDto
    {
        public Guid? AssigneeId { get; set; }
        public string AssigneeName { get; set; }
        public string Month { get; set; }
        public decimal EstimatedHours { get; set; }
        public decimal ActualHours { get; set; }
        public decimal RemainingHours { get; set; }
        public decimal EmployeeLoggedHours { get; set; }
    }
}
