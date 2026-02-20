using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    public class Limitations
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SubscriptionPlanId { get; set; }

        [ForeignKey("SubscriptionPlanId")]
        public SubscriptionPlan SubscriptionPlan { get; set; }

        public string UsersIncluded { get; set; }
        public string Projects { get; set; }
        public string StorageGB { get; set; }
        public string Support { get; set; }
    }
}

