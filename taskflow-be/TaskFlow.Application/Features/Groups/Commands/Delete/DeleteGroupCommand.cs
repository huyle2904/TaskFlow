using MediatR;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Groups.Commands.Delete;

public record DeleteGroupCommand(Guid GroupId, Guid UserId) : IRequest<bool>;

public class DeleteGroupCommandHandler : IRequestHandler<DeleteGroupCommand, bool>
{
    private readonly IGroupRepository _groupRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteGroupCommandHandler(IGroupRepository groupRepository, IUnitOfWork unitOfWork)
    {
        _groupRepository = groupRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _groupRepository.GetByIdAsync(request.GroupId);
        if (group == null)
        {
            throw new Exception("Nhóm không tồn tại");
        }

        if (group.OwnerId != request.UserId)
        {
            throw new Exception("Bạn không có quyền xóa nhóm này");
        }

        var members = await _unitOfWork.GroupMembers.GetByGroupIdAsync(group.Id);
        foreach (var member in members)
        {
            await _unitOfWork.GroupMembers.DeleteAsync(member);
        }

        var boards = await _unitOfWork.TaskBoards.GetByGroupIdAsync(group.Id);
        foreach (var board in boards)
        {
            var tasks = await _unitOfWork.TaskItems.GetTasksByBoardIdAsync(board.Id);
            foreach (var task in tasks)
            {
                await _unitOfWork.TaskItems.DeleteAsync(task);
            }
            await _unitOfWork.TaskBoards.DeleteAsync(board);
        }

        await _groupRepository.DeleteAsync(group);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}