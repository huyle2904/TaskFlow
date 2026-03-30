using AutoMapper;
using MediatR;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Groups.Queries.GetMembers;

public class GetGroupMembersQuery : IRequest<List<GroupMemberDto>>
{
    public Guid GroupId { get; set; }
    public Guid UserId { get; set; }
}

public class GetGroupMembersQueryHandler : IRequestHandler<GetGroupMembersQuery, List<GroupMemberDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGroupRepository _groupRepository;
    private readonly IMapper _mapper;

    public GetGroupMembersQueryHandler(
        IUnitOfWork unitOfWork,
        IGroupRepository groupRepository,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _groupRepository = groupRepository;
        _mapper = mapper;
    }

    public async Task<List<GroupMemberDto>> Handle(GetGroupMembersQuery request, CancellationToken cancellationToken)
    {
        var group = await _groupRepository.GetByIdAsync(request.GroupId);
        if (group == null)
        {
            return new List<GroupMemberDto>();
        }

        var memberships = await _unitOfWork.GroupMembers.GetByGroupIdAsync(request.GroupId);
        var userIds = memberships.Select(m => m.UserId).ToList();

        var users = await _unitOfWork.Users.GetByIdsAsync(userIds);

        return users.Select(u => new GroupMemberDto
        {
            Id = u.Id,
            UserId = u.Id,
            UserName = u.FullName,
            Email = u.Email,
            JoinedAt = memberships.First(m => m.UserId == u.Id).CreatedAt
        }).ToList();
    }
}