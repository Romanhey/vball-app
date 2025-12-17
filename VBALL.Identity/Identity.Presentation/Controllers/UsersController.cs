using Identity.Application.UseCases.Queries.GetUserById;
using Identity.Application.UseCases.Queries.GetUsersByIds;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Identity.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(IMediator mediator) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue("uid");
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid authentication token");
        }

        var profile = await mediator.Send(new GetUserByIdQuery(userId), cancellationToken);
        return Ok(profile);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetUserById(int id, CancellationToken cancellationToken)
    {
        var profile = await mediator.Send(new GetUserByIdQuery(id), cancellationToken);
        return Ok(profile);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetUsersByIds([FromQuery(Name = "ids")] int[] ids, CancellationToken cancellationToken)
    {
        if (ids is null || ids.Length == 0)
        {
            return BadRequest("Передайте хотя бы один идентификатор пользователя.");
        }

        var profiles = await mediator.Send(new GetUsersByIdsQuery(ids), cancellationToken);
        return Ok(profiles);
    }
}

