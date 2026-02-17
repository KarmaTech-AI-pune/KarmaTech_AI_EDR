using MediatR;
using EDR.Application.DTOs;
using System;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.Correspondence.Commands
{
    public class CreateCorrespondenceInwardCommand : IRequest<CorrespondenceInwardDto>
    {
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        [StringLength(255)]
        public string IncomingLetterNo { get; set; }
        
        [Required]
        public DateTime LetterDate { get; set; }
        
        [Required]
        [StringLength(255)]
        public string NjsInwardNo { get; set; }
        
        [Required]
        public DateTime ReceiptDate { get; set; }
        
        [Required]
        [StringLength(255)]
        public string From { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Subject { get; set; }
        
        [StringLength(500)]
        public string AttachmentDetails { get; set; }
        
        [StringLength(500)]
        public string ActionTaken { get; set; }
        
        [StringLength(500)]
        public string StoragePath { get; set; }
        
        [StringLength(1000)]
        public string Remarks { get; set; }
        
        public DateTime? RepliedDate { get; set; }
        
        public string CreatedBy { get; set; }
    }
}

