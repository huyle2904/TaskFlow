using TaskFlow.Domain.Common;
using TaskFlow.Domain.Entities;

namespace TaskFlow.Domain.Interfaces;

public interface ITaskItemAssignmentRepository : IGenericRepository<TaskItemAssignment>
{
    Task<List<TaskItemAssignment>> GetByTaskItemIdAsync(Guid taskItemId);
    Task<List<TaskItemAssignment>> GetByUserIdAsync(Guid userId);
    Task DeleteByTaskItemIdAsync(Guid taskItemId);
}