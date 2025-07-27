using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace NJS.Domain.Entities
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

        [Column(TypeName = "nvarchar(max)")]
        public string FeaturesJson { get; set; } = "{}";

        [NotMapped]
        public PlanFeatures Features 
        { 
            get => JsonSerializer.Deserialize<PlanFeatures>(FeaturesJson ?? "{}") ?? new PlanFeatures();
            set => FeaturesJson = JsonSerializer.Serialize(value);
        }

        [JsonIgnore]
        public virtual ICollection<Tenant> Tenants { get; set; } = new List<Tenant>();
    }

    public class PlanFeatures
    {
        public bool AdvancedReporting { get; set; }
        public bool CustomBranding { get; set; }
        public bool APIAccess { get; set; }
        public bool PrioritySupport { get; set; }
        public bool WhiteLabel { get; set; }
        public bool SSO { get; set; }
    }
} 