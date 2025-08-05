using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class Pricing
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SubscriptionPlanId { get; set; }

        [ForeignKey("SubscriptionPlanId")]
        public SubscriptionPlan SubscriptionPlan { get; set; }

        public string Type { get; set; } // Monthly, Onetime, Custom
        public string Currency { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public string Formatted { get; set; }
    }
}
