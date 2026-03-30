using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class GroupMember : BaseEntity
{
    public Guid GroupId { get; set; }
    public Guid UserId { get; set; }

    public Group Group { get; set; } = null!;
    public User User { get; set; } = null!;
}
