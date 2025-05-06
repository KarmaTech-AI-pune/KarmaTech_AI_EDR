using MediatR;
using NJS.Application.DTOs;
using System;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.InputRegister.Commands
{
    public class UpdateInputRegisterCommand : IRequest<InputRegisterDto>
    {
        [Required]
        public int Id { get; set; }
        
        [Required]
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
        
        public string UpdatedBy { get; set; }
    }
}
