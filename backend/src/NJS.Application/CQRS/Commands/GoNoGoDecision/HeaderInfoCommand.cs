using NJS.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.Commands.GoNoGoDecision
{
    public class HeaderInfoCommand
    {
        [Required(ErrorMessage = "Bid type is required")]
        public TypeOfBid BidType { get; set; }
        
        [Required(ErrorMessage = "Sector is required")]
        public string Sector { get; set; }
        
        [Required(ErrorMessage = "Office is required")]
        public string Office { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "Tender fee cannot be negative")]
        public int TenderFee { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "EMD amount cannot be negative")]
        public int EmdAmount { get; set; }
        
        [Required(ErrorMessage = "BD Head is required")]
        public string BdHead { get; set; }
    }
}
