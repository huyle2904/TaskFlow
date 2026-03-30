using AutoMapper;
using MediatR;
using TaskFlow.Application.Common.Exceptions;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Tasks.Commands.UpdateTask;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, TaskItemDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateTaskCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TaskItemDto> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.TaskItems.GetByIdAsync(request.TaskId);
        if (task is null)
        {
            throw new NotFoundException("TaskItem", request.TaskId);
        }

        var board = await _unitOfWork.TaskBoards.GetByIdAsync(task.BoardId);
        if (board is null || board.OwnerId != request.UserId)
        {
            throw new BadRequestException("You are not the owner of this board.");
        }

        if (request.AssignedToIds != null && request.AssignedToIds.Any())
        {
            foreach (var userId in request.AssignedToIds)
            {
                var exists = await _unitOfWork.Users.ExistsAsync(userId);
                if (!exists)
                {
                    throw new NotFoundException("User", userId);
                }
            }
        }

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.Deadline = request.Deadline;
        task.AssignedToId = request.AssignedToIds?.FirstOrDefault();

        await _unitOfWork.TaskItems.UpdateAsync(task);
        
        await _unitOfWork.TaskItemAssignments.DeleteByTaskItemIdAsync(task.Id);
        
        if (request.AssignedToIds != null && request.AssignedToIds.Any())
        {
            foreach (var userId in request.AssignedToIds)
            {
                var assignment = new Domain.Entities.TaskItemAssignment
                {
                    TaskItemId = task.Id,
                    UserId = userId
                };
                await _unitOfWork.TaskItemAssignments.AddAsync(assignment);
            }
        }
        
        await _unitOfWork.SaveChangesAsync();

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