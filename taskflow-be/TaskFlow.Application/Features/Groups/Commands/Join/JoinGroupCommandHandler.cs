using AutoMapper;
using MediatR;
using TaskFlow.Application.Common.Exceptions;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Groups.Commands.Join;

public class JoinGroupCommandHandler : IRequestHandler<JoinGroupCommand, GroupDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public JoinGroupCommandHandler(
        IUnitOfWork unitOfWork,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<GroupDto> Handle(JoinGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _unitOfWork.Groups.GetByInviteCodeAsync(request.InviteCode);
        if (group == null)
            throw new NotFoundException("Group", request.InviteCode);

        // Check if already a member
        var existingMember = await _unitOfWork.GroupMembers.GetByGroupAndUserAsync(group.Id, request.UserId);
        if (existingMember != null)
            throw new BadRequestException("Bạn đã là thành viên của nhóm này");

        // Add as member
        var member = new GroupMember
        {
            GroupId = group.Id,
            UserId = request.UserId
        };
        await _unitOfWork.GroupMembers.AddAsync(member);
        await _unitOfWork.SaveChangesAsync();

        var owner = await _userRepository.GetByIdAsync(group.OwnerId);

        return new GroupDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            OwnerId = group.OwnerId,
            OwnerName = owner?.FullName ?? "",
            InviteCode = group.InviteCode,
            MemberCount = group.Members.Count + 1,
            CreatedAt = group.CreatedAt
        };
    }
}
