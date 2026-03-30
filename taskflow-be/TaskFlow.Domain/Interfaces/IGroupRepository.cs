using TaskFlow.Domain.Entities;

namespace TaskFlow.Domain.Interfaces;

public interface IGroupRepository : IGenericRepository<Group>
{
    Task<Group?> GetByIdWithMembersAsync(Guid id);
    Task<Group?> GetByInviteCodeAsync(string inviteCode);
    Task<Group?> GetByOwnerIdAsync(Guid ownerId);
    Task<List<Group>> GetUserGroupsAsync(Guid userId);
}
