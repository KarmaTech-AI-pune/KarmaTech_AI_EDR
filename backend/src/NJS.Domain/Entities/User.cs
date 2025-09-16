﻿using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("AspNetUsers")]
    public class User : IdentityUser, ITenantEntity
    {
        public string Name { get; set; }
        
        public string? Avatar { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? LastLogin { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? StandardRate { get; set; }

        public bool IsConsultant { get; set; }

        public bool IsActive { get; set; } = true;

        public new bool TwoFactorEnabled { get; set; } = false; // Default to true for all users

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
        public int TenantId { get; set; }

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
