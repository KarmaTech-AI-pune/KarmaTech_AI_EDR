using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    [Table("TenantInvoices")]
    public class TenantInvoice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TenantId { get; set; }

        [ForeignKey("TenantId")]
        public virtual Tenant Tenant { get; set; }

        [Required]
        [MaxLength(255)]
        public string InvoiceId { get; set; } // The ID from Razorpay (e.g. inv_...)

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } // Paid, Pending, Overdue, Cancelled

        public DateTime DueDate { get; set; }

        public DateTime? PaidDate { get; set; }

        [MaxLength(255)]
        public string PaymentId { get; set; } // The ID from Razorpay (e.g. pay_...) if paid

        [MaxLength(500)]
        public string ReceiptUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
