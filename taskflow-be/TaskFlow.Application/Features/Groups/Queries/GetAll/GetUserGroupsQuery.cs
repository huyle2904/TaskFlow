using MediatR;
using TaskFlow.Application.DTOs;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.Features.Groups.Queries.GetAll;

public record GetUserGroupsQuery(Guid UserId) : IRequest<List<GroupDto>>;
