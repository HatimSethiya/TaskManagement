using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Infrastructure.Identity;
using TaskManagement.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace TaskManagement.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<TaskItem> TaskItems { get; set; }

        protected override void OnModelCreating(
            ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // ProjectMember: prevent duplicate (ProjectId, UserId)
            builder.Entity<ProjectMember>(b =>
            {
                b.HasIndex(p => new { p.ProjectId, p.UserId }).IsUnique();
                b.HasOne<ApplicationUser>()
                    .WithMany()
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Restrict);
                b.HasOne<Project>()
                    .WithMany()
                    .HasForeignKey(p => p.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // TaskItem configuration
            builder.Entity<TaskItem>(b =>
            {
                b.Property(t => t.Amount).HasColumnType("decimal(18,2)");
                b.HasOne<Project>()
                    .WithMany()
                    .HasForeignKey(t => t.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
                b.HasOne<ApplicationUser>()
                    .WithMany()
                    .HasForeignKey("AssignedToUserId")
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}