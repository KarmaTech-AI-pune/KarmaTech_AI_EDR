using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    [Table("AspNetRoles")]
    public class Role : IdentityRole, ITenantEntity
    {
        [Required]
        [MaxLength(500)]
        public string Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MinRate { get; set; }

        public bool? IsResourceRole { get; set; } = false;

        // Navigation property for Role Permissions
        public virtual ICollection<RolePermission> RolePermissions { get; set; }
        public int TenantId { get; set; }

        public Role() : base()
        {
            RolePermissions = new HashSet<RolePermission>();
        }

        public Role(string roleName) : base(roleName)
        {
            RolePermissions = new HashSet<RolePermission>();
        }
    }
}

