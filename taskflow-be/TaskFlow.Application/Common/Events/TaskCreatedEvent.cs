namespace TaskFlow.Application.Common.Events;

public record TaskCreatedEvent
{
    public Guid TaskId { get; init; }
    public string TaskTitle { get; init; } = string.Empty;
    public Guid AssigneeId { get; init; }
    public string AssigneeEmail { get; init; } = string.Empty;
    public string CreatorName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}