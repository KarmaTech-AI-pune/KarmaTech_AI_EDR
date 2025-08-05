using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class SubscriptionPlanFeature
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SubscriptionPlanId { get; set; }

        [ForeignKey("SubscriptionPlanId")]
        public SubscriptionPlan SubscriptionPlan { get; set; }

        [Required]
        public int FeatureId { get; set; }

        [ForeignKey("FeatureId")]
        public Feature Feature { get; set; }
    }
}
