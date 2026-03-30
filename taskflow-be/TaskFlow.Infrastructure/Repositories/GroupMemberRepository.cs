using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Repositories;

public class GroupMemberRepository : GenericRepository<GroupMember>, IGroupMemberRepository
{
    public GroupMemberRepository(AppDbContext context) : base(context) { }

    public async Task<GroupMember?> GetByGroupAndUserAsync(Guid groupId, Guid userId)
    {
        return await _context.GroupMembers
            .FirstOrDefaultAsync(m => m.GroupId == groupId && m.UserId == userId);
    }

    public async Task<List<GroupMember>> GetByGroupIdAsync(Guid groupId)
    {
        return await _context.GroupMembers
            .Include(m => m.User)
            .Where(m => m.GroupId == groupId)
            .ToListAsync();
    }

    public async Task<bool> IsMemberAsync(Guid groupId, Guid userId)
    {
        return await _context.GroupMembers
            .AnyAsync(m => m.GroupId == groupId && m.UserId == userId);
    }

    public async Task<List<GroupMember>> GetByUserIdAsync(Guid userId)
    {
        return await _context.GroupMembers
            .Include(m => m.Group)
            .Where(m => m.UserId == userId)
            .ToListAsync();
    }
}
