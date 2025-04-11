using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class TaskAllocationDto
    {
        public string TaskId { get; set; }
        public string Title { get; set; }
        public decimal Rate { get; set; }
        public decimal Hours { get; set; }
        public decimal Cost { get; set; }
    }

    public class EmployeeAllocationDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsConsultant { get; set; }
        public List<TaskAllocationDto> Allocations { get; set; } = new List<TaskAllocationDto>();
        public decimal TotalHours { get; set; }
        public decimal TotalCost { get; set; }
        public string Remarks { get; set; }
    }

    public class ExpenseEntryDto
    {
        public string Number { get; set; }
        public string Remarks { get; set; }
    }

    public class OutsideAgencyEntryDto
    {
        public string Description { get; set; }
        public string Rate { get; set; }
        public string Units { get; set; }
        public string Remarks { get; set; }
    }

    public class ProjectSpecificEntryDto
    {
        public string Name { get; set; }
        public string Number { get; set; }
        public string Remarks { get; set; }
    }

    public class TimeContingencyEntryDto
    {
        public string Rate { get; set; }
        public string Units { get; set; }
        public string Remarks { get; set; }
    }

    public class TimeDataDto
    {
        public List<EmployeeAllocationDto> EmployeeAllocations { get; set; } = new List<EmployeeAllocationDto>();
        public TimeContingencyEntryDto TimeContingency { get; set; }
        public decimal TotalTimeCost { get; set; }
    }

    public class ExpensesDataDto
    {
        public Dictionary<string, ExpenseEntryDto> RegularExpenses { get; set; } = new Dictionary<string, ExpenseEntryDto>();
        public ExpenseEntryDto SurveyWorks { get; set; }
        public Dictionary<string, OutsideAgencyEntryDto> OutsideAgency { get; set; } = new Dictionary<string, OutsideAgencyEntryDto>();
        public Dictionary<string, ProjectSpecificEntryDto> ProjectSpecific { get; set; } = new Dictionary<string, ProjectSpecificEntryDto>();
        public decimal TotalExpenses { get; set; }
    }

    public class ServiceTaxDataDto
    {
        public decimal Percentage { get; set; }
        public decimal Amount { get; set; }
    }
}
