using MediatR;
using TaskFlow.Application.DTOs;

namespace TaskFlow.Application.Features.Groups.Commands.Join;

public record JoinGroupCommand(string InviteCode, Guid UserId) : IRequest<GroupDto>;
