using MediatR;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Groups.Commands.Update;

public record UpdateGroupCommand(Guid GroupId, string Name, string? Description, Guid UserId) : IRequest<GroupDto>;

public class UpdateGroupCommandHandler : IRequestHandler<UpdateGroupCommand, GroupDto>
{
    private readonly IGroupRepository _groupRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateGroupCommandHandler(IGroupRepository groupRepository, IUnitOfWork unitOfWork)
    {
        _groupRepository = groupRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<GroupDto> Handle(UpdateGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _groupRepository.GetByIdAsync(request.GroupId);
        if (group == null)
        {
            throw new Exception("Nhóm không tồn tại");
        }

        if (group.OwnerId != request.UserId)
        {
            throw new Exception("Bạn không có quyền chỉnh sửa nhóm này");
        }

        group.Name = request.Name;
        group.Description = request.Description;

        await _groupRepository.UpdateAsync(group);
        await _unitOfWork.SaveChangesAsync();

        var memberCount = (await _unitOfWork.GroupMembers.GetByGroupIdAsync(group.Id)).Count;

        var owner = await _unitOfWork.Users.GetByIdAsync(group.OwnerId);

        return new GroupDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            OwnerId = group.OwnerId,
            OwnerName = owner?.FullName ?? "",
            InviteCode = group.InviteCode,
            MemberCount = memberCount,
            CreatedAt = group.CreatedAt
        };
    }
}