namespace EDR.Application.Dtos
{
    public class ChangeControlWorkflowHistoryDto
    {

        public int Id { get; set; }
        public int ChangeControlId { get; set; }
        public DateTime ActionDate { get; set; }
        public string Comments { get; set; }
        public string Status { get; set; }
        public int StatusId { get; set; }
        public string Action { get; set; }
        public string ActionBy { get; set; }
        public string AssignedToId { get; set; }
    }

}
