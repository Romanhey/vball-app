using AutoMapper;
using MediatR;
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

        [HttpPut]
        public async Task<IActionResult> UpdateMatch(int id, [FromBody] UpdateMatchDTO dto, CancellationToken cancellationToken)
        {
            await mediator.Send(mapper.Map<UpdateMatchCommand>((id, dto)), cancellationToken);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteMatch(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new DeleteMatchCommand(id), cancellationToken);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMatches(CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new GetAllMatchesQuery(), cancellationToken));
        }
    }
}
