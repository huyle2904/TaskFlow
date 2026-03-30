using TaskFlow.Domain.Entities;

namespace TaskFlow.Domain.Interfaces;

public interface IGroupMemberRepository : IGenericRepository<GroupMember>
{
    Task<GroupMember?> GetByGroupAndUserAsync(Guid groupId, Guid userId);
    Task<List<GroupMember>> GetByGroupIdAsync(Guid groupId);
    Task<List<GroupMember>> GetByUserIdAsync(Guid userId);
    Task<bool> IsMemberAsync(Guid groupId, Guid userId);
}
