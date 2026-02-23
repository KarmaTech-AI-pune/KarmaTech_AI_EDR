using NJS.Domain.Enums;

namespace NJS.Application.CQRS.Commands.GoNoGoDecision
{
    public class HeaderInfoCommand
    {
        public TypeOfBid BidType { get; set; }
        public string Sector { get; set; }
        public string Office { get; set; }
        public int TenderFee { get; set; }
        public int EmdAmount { get; set; }
        public string BdHead { get; set; }
    }
}
