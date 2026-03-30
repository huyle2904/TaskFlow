using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs;
using TaskFlow.Application.Features.Groups.Commands.Create;
using TaskFlow.Application.Features.Groups.Commands.Delete;
using TaskFlow.Application.Features.Groups.Commands.Join;
using TaskFlow.Application.Features.Groups.Commands.Update;
using TaskFlow.Application.Features.Groups.Queries.GetAll;
using TaskFlow.Application.Features.Groups.Queries.GetMembers;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GroupsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GroupsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdString!);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<GroupDto>), 200)]
    public async Task<ActionResult<List<GroupDto>>> GetMyGroups()
    {
        var query = new GetUserGroupsQuery(GetUserId());
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(GroupDto), 201)]
    public async Task<ActionResult<GroupDto>> CreateGroup(CreateGroupDto dto)
    {
        var command = new CreateGroupCommand(dto.Name, dto.Description, GetUserId());
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetMyGroups), result);
    }

    [HttpPost("join")]
    [ProducesResponseType(typeof(GroupDto), 200)]
    public async Task<ActionResult<GroupDto>> JoinGroup(JoinGroupDto dto)
    {
        var command = new JoinGroupCommand(dto.InviteCode, GetUserId());
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{groupId}/members")]
    [ProducesResponseType(typeof(List<GroupMemberDto>), 200)]
    public async Task<ActionResult<List<GroupMemberDto>>> GetGroupMembers(Guid groupId)
    {
        var query = new GetGroupMembersQuery { GroupId = groupId, UserId = GetUserId() };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("{groupId}")]
    [ProducesResponseType(typeof(GroupDto), 200)]
    public async Task<ActionResult<GroupDto>> UpdateGroup(Guid groupId, UpdateGroupDto dto)
    {
        var command = new UpdateGroupCommand(groupId, dto.Name, dto.Description, GetUserId());
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{groupId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteGroup(Guid groupId)
    {
        var command = new DeleteGroupCommand(groupId, GetUserId());
        await _mediator.Send(command);
        return NoContent();
    }
}
