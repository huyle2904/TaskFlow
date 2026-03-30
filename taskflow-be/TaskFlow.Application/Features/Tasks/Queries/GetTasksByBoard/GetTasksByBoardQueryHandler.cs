using MediatR;
using TaskFlow.Application.Common.Exceptions;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Tasks.Queries.GetTasksByBoard;

public class GetTasksByBoardQueryHandler : IRequestHandler<GetTasksByBoardQuery, List<TaskItemDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetTasksByBoardQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TaskItemDto>> Handle(GetTasksByBoardQuery request, CancellationToken cancellationToken)
    {
        var board = await _unitOfWork.TaskBoards.GetByIdAsync(request.BoardId);
        if (board == null)
        {
            throw new NotFoundException("TaskBoard", request.BoardId);
        }

        var isOwner = board.OwnerId == request.UserId;
        var isGroupMember = false;
        
        if (board.GroupId.HasValue)
        {
            isGroupMember = await _unitOfWork.GroupMembers.IsMemberAsync(board.GroupId.Value, request.UserId);
        }

        if (!isOwner && !isGroupMember)
        {
            throw new ForbiddenException("Bạn không có quyền truy cập board này.");
        }

        var tasks = await _unitOfWork.TaskItems.GetTasksByBoardIdAsync(request.BoardId);
        var taskList = tasks.ToList();
        
        var taskDtos = new List<TaskItemDto>();
        
        foreach (var task in taskList)
        {
            var isOverdue = task.Deadline.HasValue && 
                           task.Deadline.Value < DateTime.UtcNow && 
                           task.Status != Domain.Enums.TaskItemStatus.Done;

            taskDtos.Add(new TaskItemDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
                Deadline = task.Deadline,
                IsOverdue = isOverdue,
                IsPrivate = task.IsPrivate,
                BoardId = task.BoardId,
                AssignedToId = task.AssignedToId,
                AssignedToName = task.AssignedTo?.FullName,
                AssignedToIds = new List<Guid>(),
                AssignedToNames = new List<string>(),
                CreatedAt = task.CreatedAt
            });
        }

        return taskDtos;
    }
}