namespace TaskFlow.Application.DTOs;

public record GroupDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid OwnerId { get; init; }
    public string OwnerName { get; init; } = string.Empty;
    public string InviteCode { get; init; } = string.Empty;
    public int MemberCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateGroupDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

public record UpdateGroupDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

public record GroupMemberDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public DateTime JoinedAt { get; init; }
}

public record JoinGroupDto
{
    public string InviteCode { get; init; } = string.Empty;
}
