using System;

namespace EDR.Application.Dtos
{
    public class UserWBSTaskVersionHistoryDto
    {
        public int Id { get; set; }
        public int WBSTaskVersionHistoryId { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Unit { get; set; }
        public decimal CostRate { get; set; }
        public decimal TotalCost { get; set; }
        public DateTime AssignedDate { get; set; }
        public string Role { get; set; }
        public string Status { get; set; }
        public string CreatedBy { get; set; }
        public int? ResourceRoleId { get; set; }
    }
}

