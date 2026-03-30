using MediatR;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Groups.Commands.Create;

public record CreateGroupCommand(string Name, string? Description, Guid OwnerId) : IRequest<GroupDto>;
