using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Schedule.Application.DTO.Match;
using Schedule.Application.UseCases.Match;
using Schedule.Application.UseCases.Match.DeleteMatch;
using Schedule.Application.UseCases.Match.GetAllMatches;
using Schedule.Application.UseCases.Match.GetMatch;
using Schedule.Application.UseCases.Match.UpdateMatch;

namespace Schedule.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchController(IMediator mediator, IMapper mapper) : ControllerBase
    {
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateMatch([FromBody] CreateMatchDTO dto, CancellationToken cancellationToken)
        {
            await mediator.Send(mapper.Map<CreateMatchCommand>(dto), cancellationToken);
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMatchById(int id, CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new GetMatchQuery(id), cancellationToken));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMatch(int id, [FromBody] UpdateMatchDTO dto, CancellationToken cancellationToken)
        {
            await mediator.Send(mapper.Map<UpdateMatchCommand>((id, dto)), cancellationToken);
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/start")]
        public async Task<IActionResult> StartMatch(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new StartMatchCommand(id), cancellationToken);
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/finish")]
        public async Task<IActionResult> FinishMatch(int id, [FromBody] string finalScore, CancellationToken cancellationToken)
        {
            await mediator.Send(new FinishMatchCommand(id, finalScore), cancellationToken);
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMatch(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new DeleteMatchCommand(id), cancellationToken);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMatches([FromQuery] MatchFilterDTO dto, int skip, int take, CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new GetAllMatchesQuery(dto, skip, take), cancellationToken));
        }
    }
}
