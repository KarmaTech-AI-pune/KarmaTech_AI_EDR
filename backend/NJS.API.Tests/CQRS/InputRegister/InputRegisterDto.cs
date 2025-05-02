using System;
using System.ComponentModel.DataAnnotations;

namespace NJS.API.Tests.CQRS.InputRegister
{
    public class InputRegisterDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        
        [Required]
        [StringLength(255)]
        public string DataReceived { get; set; }
        
        public DateTime ReceiptDate { get; set; }
        
        [Required]
        [StringLength(255)]
        public string ReceivedFrom { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FilesFormat { get; set; }
        
        public int NoOfFiles { get; set; }
        public bool FitForPurpose { get; set; }
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
        public DateTime CreatedAt { get; set; }
        
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
