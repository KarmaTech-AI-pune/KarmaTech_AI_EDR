using System.ComponentModel.DataAnnotations;
using EDR.Domain.Enums;

namespace EDR.Application.CQRS.Commands.GoNoGoDecision
{
    public class HeaderInfoCommand
    {
        public TypeOfBid BidType { get; set; }
        public string Sector { get; set; }
        public string Office { get; set; }
        [Range(0, int.MaxValue)]
        public int TenderFee { get; set; }
        [Range(0, int.MaxValue)]
        public int EmdAmount { get; set; }
        public string BdHead { get; set; }
    }
}

