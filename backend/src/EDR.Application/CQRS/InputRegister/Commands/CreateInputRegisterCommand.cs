using MediatR;
using EDR.Application.DTOs;
using System;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.InputRegister.Commands
{
    public class CreateInputRegisterCommand : IRequest<InputRegisterDto>
    {
        public int ProjectId { get; set; }
        
        [Required]
        [StringLength(255)]
        public string DataReceived { get; set; }
        
        [Required]
        public DateTime ReceiptDate { get; set; }
        
        [Required]
        [StringLength(255)]
        public string ReceivedFrom { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FilesFormat { get; set; }
        
        [Required]
        public int NoOfFiles { get; set; }
        
        [Required]
        public bool FitForPurpose { get; set; }
        
        [Required]
        public bool Check { get; set; }
        
        [StringLength(255)]
        public string CheckedBy { get; set; }
        
        public DateTime? CheckedDate { get; set; }
        
        [StringLength(255)]
        public string Custodian { get; set; }
        
        [StringLength(500)]
        public string StoragePath { get; set; }
        
        [StringLength(1000)]
        public string Remarks { get; set; }
        
        public string CreatedBy { get; set; }
    }
}

