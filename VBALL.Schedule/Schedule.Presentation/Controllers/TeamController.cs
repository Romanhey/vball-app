using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Schedule.Application.DTO.Team;
using Schedule.Application.UseCases.Team.CreateTeam;
using Schedule.Application.UseCases.Team.DeleteTeam;
using Schedule.Application.UseCases.Team.GetAllTeams;
using Schedule.Application.UseCases.Team.GetTeam;
using Schedule.Application.UseCases.Team.UpdateTeam;

namespace Schedule.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeamController(IMediator mediator, IMapper mapper) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamDTO dto, CancellationToken cancellationToken)
        {
            await mediator.Send(mapper.Map<CreateTeamCommand>(dto), cancellationToken);
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTeamById(int id, CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new GetTeamQuery(id), cancellationToken));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTeam(int id, [FromBody] UpdateTeamDTO dto, CancellationToken cancellationToken)
        {
            await mediator.Send(mapper.Map<UpdateTeamCommand>((id, dto)), cancellationToken);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTeam(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new DeleteTeamCommand(id), cancellationToken);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTeams(CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new GetAllTeamsQuery(), cancellationToken));
        }
    }
}