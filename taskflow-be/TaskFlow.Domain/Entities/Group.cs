using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class Group : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid OwnerId { get; set; }
    public string InviteCode { get; set; } = string.Empty;

    public User Owner { get; set; } = null!;
    public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
    public ICollection<TaskBoard> Boards { get; set; } = new List<TaskBoard>();
}
