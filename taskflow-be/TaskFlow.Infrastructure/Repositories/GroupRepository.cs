using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.Repositories;

public class GroupRepository : GenericRepository<Group>, IGroupRepository
{
    public GroupRepository(AppDbContext context) : base(context) { }

    public async Task<Group?> GetByIdWithMembersAsync(Guid id)
    {
        return await _context.Groups
            .Include(g => g.Members)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<Group?> GetByInviteCodeAsync(string inviteCode)
    {
        return await _context.Groups
            .FirstOrDefaultAsync(g => g.InviteCode == inviteCode);
    }

    public async Task<Group?> GetByOwnerIdAsync(Guid ownerId)
    {
        return await _context.Groups
            .FirstOrDefaultAsync(g => g.OwnerId == ownerId);
    }

    public async Task<List<Group>> GetUserGroupsAsync(Guid userId)
    {
        return await _context.GroupMembers
            .Where(m => m.UserId == userId)
            .Select(m => m.Group)
            .ToListAsync();
    }
}
