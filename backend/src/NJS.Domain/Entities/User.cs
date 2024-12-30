using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class User : IdentityUser
    {
        public string? Avatar { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? LastLogin { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? StandardRate { get; set; }

        public bool IsConsultant { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation property for WBS Tasks
        public ICollection<UserWBSTask> UserWBSTasks { get; set; }

        // Navigation property for Project Resources
        public ICollection<ProjectResource> ProjectResources { get; set; }

        // Inverse navigation properties for managed projects
        [InverseProperty("ProjectManager")]
        public virtual ICollection<Project> ManagedProjects { get; set; }

        [InverseProperty("RegionalManager")]
        public virtual ICollection<Project> RegionalManagerProjects { get; set; }

        [InverseProperty("SeniorProjectManager")]
        public virtual ICollection<Project> SeniorManagedProjects { get; set; }

        public ICollection<OpportunityHistory> OpportunityHistories { get; set; } = [];

        public User()
        {
            UserWBSTasks = new List<UserWBSTask>();
            ProjectResources = new List<ProjectResource>();
            ManagedProjects = new List<Project>();
            RegionalManagerProjects = new List<Project>();
            SeniorManagedProjects = new List<Project>();
        }
    }
}
