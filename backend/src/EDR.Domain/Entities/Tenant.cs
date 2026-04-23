using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    [Table("Tenants")]
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
        public string RazorpayCustomerId { get; set; }

        [MaxLength(255)]
        public string RazorpaySubscriptionId { get; set; }

        public int? SubscriptionPlanId { get; set; }

        [ForeignKey("SubscriptionPlanId")]
        public virtual SubscriptionPlan SubscriptionPlan { get; set; }

        public int MaxUsers { get; set; } = 10;

        public int MaxProjects { get; set; } = 50;

        [MaxLength(1000)]
        public string? LogoUrl { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsIsolated { get; set; } = false;


        // Navigation properties
        public virtual ICollection<TenantUser> TenantUsers { get; set; } = new List<TenantUser>();
        public virtual ICollection<TenantDatabase> TenantDatabases { get; set; } = new List<TenantDatabase>();

        [NotMapped]
        public bool IsBlocked => GetBlockInfo().IsBlocked;

        [NotMapped]
        public string BlockReason => GetBlockInfo().Message;

        [NotMapped]
        public string BlockErrorCode => GetBlockInfo().ErrorCode;

        private (bool IsBlocked, string Message, string ErrorCode) GetBlockInfo()
        {
            if (Status == TenantStatus.Suspended)
                return (true, "This tenant account has been suspended. Please contact support.", "TENANT_SUSPENDED");

            if (Status == TenantStatus.Cancelled)
                return (true, "This tenant account has been cancelled.", "TENANT_CANCELLED");

            if (Status == TenantStatus.Expired)
                return (true, "Your subscription has expired. Please update your plan to restore access.", "TENANT_EXPIRED");

            if (Status == TenantStatus.Trial)
            {
                if (TrialEndDate.HasValue && TrialEndDate.Value < DateTime.UtcNow)
                {
                    return (true, "Your trial period has expired. Please subscribe to a plan to continue.", "TRIAL_EXPIRED");
                }
            }
            else if (Status == TenantStatus.Active)
            {
                if (SubscriptionEndDate.HasValue && SubscriptionEndDate.Value < DateTime.UtcNow)
                {
                    return (true, "Your subscription has expired. Please renew your plan to restore access.", "SUBSCRIPTION_EXPIRED");
                }
            }

            return (false, string.Empty, string.Empty);
        }
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

