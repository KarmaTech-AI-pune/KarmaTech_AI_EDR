using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("Permissions")]
    public class Permission
    {
        [Key]
        public int Id { get; set; }      

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        [StringLength(100)]
        public string Category { get; set; }

        // Navigation property for Role Permissions
        public virtual ICollection<RolePermission> RolePermissions { get; set; }

        public Permission()
        {
            RolePermissions = new HashSet<RolePermission>();
        }
    }
}
