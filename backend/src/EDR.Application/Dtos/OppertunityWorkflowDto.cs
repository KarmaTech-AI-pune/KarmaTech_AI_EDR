namespace EDR.Application.Dtos
{
    public class OppertunityWorkflowDto
    {
        public int OppertunityId { get; set; }
        public string AssignedToId { get; set; }
        public string Action { get; set; }// For BD manager only Send for Review
        public string Commnets { get; set; }
    }
}

