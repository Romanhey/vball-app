using Identity.Application.DTO;
using Identity.Application.UseCases.Commands.LoginUser;
using Identity.Application.UseCases.Commands.RefreshAccessToken;
using Identity.Application.UseCases.Commands.RegisterUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IMediator mediator) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO model, CancellationToken cancellationToken)
        {
            await mediator.Send(new RegisterUserCommand(model), cancellationToken);
            return Ok();
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO model,CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new LoginUserCommand(model), cancellationToken));
        }

        [Authorize]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshAccessToken(CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new RefreshAccessTokenComand(), cancellationToken));
        }
    }
}
