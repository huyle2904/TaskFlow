using AutoMapper;
using MediatR;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Groups.Queries.GetAll;

public class GetUserGroupsQueryHandler : IRequestHandler<GetUserGroupsQuery, List<GroupDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetUserGroupsQueryHandler(
        IUnitOfWork unitOfWork,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<List<GroupDto>> Handle(GetUserGroupsQuery request, CancellationToken cancellationToken)
    {
        var groupMembers = await _unitOfWork.GroupMembers.GetByUserIdAsync(request.UserId);
        
        // Get all group IDs the user is a member of
        var memberGroupIds = groupMembers.Select(m => m.GroupId).ToList();
        
        var groups = new List<GroupDto>();
        foreach (var groupId in memberGroupIds)
        {
            var group = await _unitOfWork.Groups.GetByIdWithMembersAsync(groupId);
            if (group != null)
            {
                var owner = await _userRepository.GetByIdAsync(group.OwnerId);
                groups.Add(new GroupDto
                {
                    Id = group.Id,
                    Name = group.Name,
                    Description = group.Description,
                    OwnerId = group.OwnerId,
                    OwnerName = owner?.FullName ?? "",
                    InviteCode = group.InviteCode,
                    MemberCount = group.Members.Count,
                    CreatedAt = group.CreatedAt
                });
            }
        }

        return groups;
    }
}
