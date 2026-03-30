using AutoMapper;
using MediatR;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Boards.Queries.GetBoardsByGroup;

public class GetBoardsByGroupQuery : IRequest<List<TaskBoardDto>>
{
    public Guid GroupId { get; set; }
    public Guid UserId { get; set; }
}

public class GetBoardsByGroupQueryHandler : IRequestHandler<GetBoardsByGroupQuery, List<TaskBoardDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGroupRepository _groupRepository;
    private readonly IMapper _mapper;

    public GetBoardsByGroupQueryHandler(
        IUnitOfWork unitOfWork,
        IGroupRepository groupRepository,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _groupRepository = groupRepository;
        _mapper = mapper;
    }

    public async Task<List<TaskBoardDto>> Handle(GetBoardsByGroupQuery request, CancellationToken cancellationToken)
    {
        var group = await _groupRepository.GetByIdAsync(request.GroupId);
        if (group == null)
        {
            return new List<TaskBoardDto>();
        }

        var memberships = await _unitOfWork.GroupMembers.GetByUserIdAsync(request.UserId);
        var isMember = memberships.Any(m => m.GroupId == request.GroupId);

        if (!isMember)
        {
            return new List<TaskBoardDto>();
        }

        var boards = await _unitOfWork.TaskBoards.GetByGroupIdAsync(request.GroupId);
        
        var result = new List<TaskBoardDto>();
        foreach (var board in boards)
        {
            var dto = new TaskBoardDto
            {
                Id = board.Id,
                Name = board.Name,
                Description = board.Description,
                OwnerId = board.OwnerId,
                GroupId = board.GroupId,
                GroupName = group.Name,
                CreatedAt = board.CreatedAt,
                TaskCount = (await _unitOfWork.TaskItems.GetTasksByBoardIdAsync(board.Id)).Count()
            };
            result.Add(dto);
        }

        return result;
    }
}