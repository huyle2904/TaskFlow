using AutoMapper;
using MediatR;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Boards.Queries.GetBoards;

public class GetBoardsQueryHandler : IRequestHandler<GetBoardsQuery, List<TaskBoardDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGroupRepository _groupRepository;
    private readonly IMapper _mapper;

    public GetBoardsQueryHandler(
        IUnitOfWork unitOfWork,
        IGroupRepository groupRepository,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _groupRepository = groupRepository;
        _mapper = mapper;
    }

    public async Task<List<TaskBoardDto>> Handle(GetBoardsQuery request, CancellationToken cancellationToken)
    {
        // Get boards owned by user
        var boards = await _unitOfWork.TaskBoards.GetBoardsByOwnerIdAsync(request.UserId);
        
        // Get user's groups (all groups user is member of)
        var myGroupMemberships = await _unitOfWork.GroupMembers.GetByUserIdAsync(request.UserId);
        var groupIds = myGroupMemberships.Select(m => m.GroupId).ToList();
        
        // If user is in groups, get boards from those groups too
        if (groupIds.Any())
        {
            var groupBoards = await _unitOfWork.TaskBoards.GetByGroupIdsAsync(groupIds);
            boards = boards.Concat(groupBoards).ToList();
        }

        // Map and add task count
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
                CreatedAt = board.CreatedAt,
                TaskCount = (await _unitOfWork.TaskItems.GetTasksByBoardIdAsync(board.Id)).Count()
            };
            
            if (board.GroupId.HasValue)
            {
                var group = await _groupRepository.GetByIdAsync(board.GroupId.Value);
                dto = new TaskBoardDto
                {
                    Id = dto.Id,
                    Name = dto.Name,
                    Description = dto.Description,
                    OwnerId = dto.OwnerId,
                    GroupId = dto.GroupId,
                    GroupName = group?.Name,
                    CreatedAt = dto.CreatedAt,
                    TaskCount = dto.TaskCount
                };
            }
            
            result.Add(dto);
        }

        return result;
    }
}
