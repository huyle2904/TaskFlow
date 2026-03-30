using AutoMapper;
using MediatR;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Boards.Commands.CreateBoard;

public class CreateBoardCommandHandler : IRequestHandler<CreateBoardCommand, TaskBoardDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateBoardCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TaskBoardDto> Handle(CreateBoardCommand request, CancellationToken cancellationToken)
    {
        var board = new TaskBoard
        {
            Name = request.Name,
            Description = request.Description,
            OwnerId = request.OwnerId,
            GroupId = request.GroupId
        };

        await _unitOfWork.TaskBoards.AddAsync(board);
        await _unitOfWork.SaveChangesAsync();

        var boardDto = _mapper.Map<TaskBoardDto>(board);
        
        // Add task count
var tasks = await _unitOfWork.TaskItems.GetTasksByBoardIdAsync(board.Id);
        var taskCount = tasks.Count();

        return new TaskBoardDto
        {
            Id = board.Id,
            Name = board.Name,
            Description = board.Description,
            OwnerId = board.OwnerId,
            GroupId = board.GroupId,
            CreatedAt = board.CreatedAt,
            TaskCount = taskCount
        };
    }
}
