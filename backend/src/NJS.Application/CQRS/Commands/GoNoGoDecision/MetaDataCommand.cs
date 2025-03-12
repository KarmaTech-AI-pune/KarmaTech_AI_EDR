namespace NJS.Application.CQRS.Commands.GoNoGoDecision
{
    public class MetaDataCommand
    {
        public int OpprotunityId { get; set; }
        public string CompletedDate { get; set; }
        public string CompletedBy { get; set; }
    }
}
