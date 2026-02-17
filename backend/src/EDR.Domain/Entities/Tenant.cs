using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    public class Tenant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; }

        [Required]
        [MaxLength(255)]
        public string Domain { get; set; }

        [MaxLength(255)]
        public string CompanyName { get; set; }

        [MaxLength(255)]
        public string ContactEmail { get; set; }

        [MaxLength(255)]
        public string ContactPhone { get; set; }

        public TenantStatus Status { get; set; } = TenantStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? TrialEndDate { get; set; }

        public DateTime? SubscriptionEndDate { get; set; }

        [MaxLength(255)]
        public string StripeCustomerId { get; set; }

        [MaxLength(255)]
        public string StripeSubscriptionId { get; set; }

        public int? SubscriptionPlanId { get; set; }

        [ForeignKey("SubscriptionPlanId")]
        public virtual SubscriptionPlan SubscriptionPlan { get; set; }

        public int MaxUsers { get; set; } = 10;

        public int MaxProjects { get; set; } = 50;

        public bool IsActive { get; set; } = true;
        public bool IsIsolated { get; set; } = false;


        // Navigation properties
        public virtual ICollection<TenantUser> TenantUsers { get; set; } = new List<TenantUser>();
        public virtual ICollection<TenantDatabase> TenantDatabases { get; set; } = new List<TenantDatabase>();
    }

    public enum TenantStatus
    {
        Active,
        Suspended,
        Cancelled,
        Trial,
        Expired
    }
}

