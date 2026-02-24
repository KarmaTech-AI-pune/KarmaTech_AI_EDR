using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace EDR.Domain.Entities
{
    public class SubscriptionPlan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlyPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal YearlyPrice { get; set; }

        public int MaxUsers { get; set; }

        public int MaxProjects { get; set; }

        public int MaxStorageGB { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(255)]
        public string StripePriceId { get; set; }

        [JsonIgnore]
        public virtual ICollection<Tenant> Tenants { get; set; } = new List<Tenant>();

        public virtual ICollection<SubscriptionPlanFeature> SubscriptionPlanFeatures { get; set; }
    }
}

