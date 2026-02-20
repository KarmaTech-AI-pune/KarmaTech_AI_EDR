namespace EDR.Application.Dtos.Dashboard
{
    public class PendingApprovalItemDto
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Project { get; set; }
        public string Manager { get; set; }
        public int DaysWaiting { get; set; }
        public string Impact { get; set; }
    }
}

