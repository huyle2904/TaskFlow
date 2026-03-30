using AutoMapper;
using MediatR;
using TaskFlow.Application.Common.Exceptions;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Tasks.Commands.CreateTask;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskItemDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateTaskCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TaskItemDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var board = await _unitOfWork.TaskBoards.GetByIdAsync(request.BoardId);
        if (board is null)
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
            throw new ForbiddenException("Bạn không có quyền tạo task trong board này.");
        }

        if (request.AssignedToIds != null && request.AssignedToIds.Any())
        {
            foreach (var userId in request.AssignedToIds)
            {
                var assignedUser = await _unitOfWork.Users.GetByIdAsync(userId);
                if (assignedUser is null)
                {
                    throw new NotFoundException("User", userId);
                }
            }
        }

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            Deadline = request.Deadline,
            BoardId = request.BoardId,
            IsPrivate = request.IsPrivate,
            AssignedToId = request.AssignedToIds?.FirstOrDefault()
        };

        await _unitOfWork.TaskItems.AddAsync(task);
        await _unitOfWork.SaveChangesAsync();

        if (request.AssignedToIds != null && request.AssignedToIds.Any())
        {
            foreach (var userId in request.AssignedToIds)
            {
                var assignment = new TaskItemAssignment
                {
                    TaskItemId = task.Id,
                    UserId = userId
                };
                await _unitOfWork.TaskItemAssignments.AddAsync(assignment);
            }
            await _unitOfWork.SaveChangesAsync();
        }

        var result = _mapper.Map<TaskItemDto>(task);
        
        if (request.AssignedToIds != null && request.AssignedToIds.Any())
        {
            var assignments = await _unitOfWork.TaskItemAssignments.GetByTaskItemIdAsync(task.Id);
            var users = await _unitOfWork.Users.GetByIdsAsync(assignments.Select(a => a.UserId).ToList());
            
            result = result with
            {
                AssignedToIds = assignments.Select(a => a.UserId).ToList(),
                AssignedToNames = users.Select(u => u.FullName).ToList()
            };
        }

        return result;
    }
}