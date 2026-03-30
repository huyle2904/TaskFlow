using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Common;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Repositories;

public class TaskItemAssignmentRepository : GenericRepository<TaskItemAssignment>, ITaskItemAssignmentRepository
{
    public TaskItemAssignmentRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<List<TaskItemAssignment>> GetByTaskItemIdAsync(Guid taskItemId)
    {
        return await _dbSet.Where(ta => ta.TaskItemId == taskItemId).ToListAsync();
    }

    public async Task<List<TaskItemAssignment>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet.Where(ta => ta.UserId == userId).ToListAsync();
    }

    public async Task DeleteByTaskItemIdAsync(Guid taskItemId)
    {
        var assignments = await _dbSet.Where(ta => ta.TaskItemId == taskItemId).ToListAsync();
        _dbSet.RemoveRange(assignments);
    }
}