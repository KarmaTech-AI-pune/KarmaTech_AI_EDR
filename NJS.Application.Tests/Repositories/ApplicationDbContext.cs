using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;

namespace NJS.Application.Tests.Repositories
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<InputRegister> InputRegisters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure InputRegister entity
            modelBuilder.Entity<InputRegister>()
                .HasKey(ir => ir.Id);

            modelBuilder.Entity<InputRegister>()
                .Property(ir => ir.DataReceived)
                .IsRequired()
                .HasMaxLength(255);

            modelBuilder.Entity<InputRegister>()
                .Property(ir => ir.ReceivedFrom)
                .IsRequired()
                .HasMaxLength(255);

            modelBuilder.Entity<InputRegister>()
                .Property(ir => ir.FilesFormat)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<InputRegister>()
                .Property(ir => ir.CheckedBy)
                .HasMaxLength(255);

            modelBuilder.Entity<InputRegister>()
                .Property(ir => ir.Custodian)
                .HasMaxLength(255);

            modelBuilder.Entity<InputRegister>()
                .Property(ir => ir.StoragePath)
                .HasMaxLength(500);

            modelBuilder.Entity<InputRegister>()
                .Property(ir => ir.Remarks)
                .HasMaxLength(1000);
        }
    }
}
