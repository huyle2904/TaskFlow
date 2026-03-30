using MediatR;
using TaskFlow.Application.DTOs;

namespace TaskFlow.Application.Features.Users.Queries.GetAllUsers;

public record GetAllUsersQuery : IRequest<List<UserDto>>;
