using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("TwoFactorCodes")]
    public class TwoFactorCode
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [StringLength(6)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        public DateTime ExpiresAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsUsed { get; set; } = false;
        
        public int TenantId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}


