using TaskFlow.Domain.Entities;

namespace TaskFlow.Domain.Interfaces;

public interface ITaskBoardRepository : IGenericRepository<TaskBoard>
{
    Task<IEnumerable<TaskBoard>> GetBoardsByOwnerIdAsync(Guid ownerId);
    Task<TaskBoard?> GetBoardWithTasksAsync(Guid boardId);
    Task<IEnumerable<TaskBoard>> GetByGroupIdsAsync(List<Guid> groupIds);
    Task<IEnumerable<TaskBoard>> GetByGroupIdAsync(Guid groupId);
}
