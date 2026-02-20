using System;

namespace EDR.Application.Dtos
{
    public class JobStartFormResourceDto
    {
        public int ResourceId { get; set; }
        public int FormId { get; set; }
        public int? WBSTaskId { get; set; }
        public int TaskType { get; set; } // 0 = Manpower/Time, 1 = ODC/Expenses
        public string Description { get; set; }
        public decimal Rate { get; set; }
        public decimal Units { get; set; }
        public decimal BudgetedCost { get; set; }
        public string Remarks { get; set; }
        public string EmployeeName { get; set; } // For Manpower resources (TaskType = 0)
        public string Name { get; set; } // For ODC resources (TaskType = 1)
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}

