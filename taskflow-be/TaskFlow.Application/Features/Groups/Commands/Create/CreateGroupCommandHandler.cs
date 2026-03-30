using AutoMapper;
using MediatR;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Groups.Commands.Create;

public class CreateGroupCommandHandler : IRequestHandler<CreateGroupCommand, GroupDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateGroupCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GroupDto> Handle(CreateGroupCommand request, CancellationToken cancellationToken)
    {
        var group = new Group
        {
            Name = request.Name,
            Description = request.Description,
            OwnerId = request.OwnerId,
            InviteCode = Guid.NewGuid().ToString("N")[..8].ToUpper()
        };

        await _unitOfWork.Groups.AddAsync(group);

        // Add owner as first member
        var member = new GroupMember
        {
            GroupId = group.Id,
            UserId = request.OwnerId
        };
        await _unitOfWork.GroupMembers.AddAsync(member);

        await _unitOfWork.SaveChangesAsync();

        return new GroupDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            OwnerId = group.OwnerId,
            OwnerName = "",
            InviteCode = group.InviteCode,
            MemberCount = 1,
            CreatedAt = group.CreatedAt
        };
    }
}
