using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskFlow.Domain.Entities;

namespace TaskFlow.Infrastructure.Data.Configurations;

public class TaskItemAssignmentConfiguration : IEntityTypeConfiguration<TaskItemAssignment>
{
    public void Configure(EntityTypeBuilder<TaskItemAssignment> builder)
    {
        builder.HasKey(ta => ta.Id);

        builder.HasIndex(ta => new { ta.TaskItemId, ta.UserId }).IsUnique();

        builder.HasOne(ta => ta.TaskItem)
            .WithMany(t => t.Assignments)
            .HasForeignKey(ta => ta.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ta => ta.User)
            .WithMany()
            .HasForeignKey(ta => ta.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}