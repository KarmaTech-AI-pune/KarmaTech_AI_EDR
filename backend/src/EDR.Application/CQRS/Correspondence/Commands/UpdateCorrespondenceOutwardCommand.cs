using MediatR;
using EDR.Application.DTOs;
using System;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.Correspondence.Commands
{
    public class UpdateCorrespondenceOutwardCommand : IRequest<CorrespondenceOutwardDto>
    {
        [Required]
        public int Id { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        [StringLength(255)]
        public string LetterNo { get; set; }
        
        [Required]
        public DateTime LetterDate { get; set; }
        
        [Required]
        [StringLength(255)]
        public string To { get; set; }
        
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
        
        [StringLength(255)]
        public string Acknowledgement { get; set; }
        
        public string UpdatedBy { get; set; }
    }
}

