using TaskFlow.Domain.Enums;

namespace TaskFlow.Application.DTOs;

// ===== TASK DTOs =====

/// <summary>
/// Output DTO for TaskItem.
/// </summary>
public record TaskItemDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public TaskItemStatus Status { get; init; }
    public TaskPriority Priority { get; init; }
    public DateTime? Deadline { get; init; }
    public bool IsOverdue { get; init; }
    public bool IsPrivate { get; init; }
    public Guid BoardId { get; init; }
    public Guid? AssignedToId { get; init; }  // Keep for backward compatibility
    public string? AssignedToName { get; init; }  // Keep for backward compatibility
    public List<Guid> AssignedToIds { get; init; } = new();
    public List<string> AssignedToNames { get; init; } = new();
    public DateTime CreatedAt { get; init; }
}

public record CreateTaskDto(
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? Deadline,
    List<Guid>? AssignedToIds,
    bool IsPrivate = false
);

public record UpdateTaskDto(
    string Title,
    string? Description,
    TaskItemStatus Status,
    TaskPriority Priority,
    DateTime? Deadline,
    List<Guid>? AssignedToIds,
    bool IsPrivate = false
);
