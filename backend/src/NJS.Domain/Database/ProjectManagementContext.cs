//File: backend/src/NJS.Domain/Database/ProjectManagementContext.cs
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;
using System;

namespace NJS.Domain.Database
{
    public class ProjectManagementContext : DbContext
    {
       public ProjectManagementContext(DbContextOptions<ProjectManagementContext> options) : base(options)
        {
        }

        public DbSet<Project> Projects {  get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
