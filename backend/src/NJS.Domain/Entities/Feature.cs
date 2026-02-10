using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class Feature
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }
        
        public bool IsActive { get; set; } = true;

        public virtual ICollection<SubscriptionPlanFeature> SubscriptionPlanFeatures { get; set; }
    }
}
