using Identity.Application.DTO;
using Identity.Application.UseCases.Commands;
using MediatR;
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
            return Ok(await mediator.Send(model, cancellationToken));
        }
    }
}
