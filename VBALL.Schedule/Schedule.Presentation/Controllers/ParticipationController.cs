using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Schedule.Application.DTO.Participation;
using Schedule.Application.UseCases.Participation.CreateParticipation;
using Schedule.Application.UseCases.Participation.DeleteParticipation;
using Schedule.Application.UseCases.Participation.GetAllParticipation;
using Schedule.Application.UseCases.Participation.GetParticipation;
using Schedule.Application.UseCases.Participation.UpdateParticipation;

namespace Schedule.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParticipationController(IMediator mediator, IMapper mapper) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateParticipation([FromBody] CreateParticipationDTO dto, CancellationToken cancellationToken)
        {
            await mediator.Send(mapper.Map<CreateParticipationCommand>(dto), cancellationToken);
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetParticipationById(int id, CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new GetParticipationQuery(id), cancellationToken));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateParticipation(int id, [FromBody] UpdateParticipationDTO dto, CancellationToken cancellationToken)
        {
            await mediator.Send(mapper.Map<UpdateParticipationCommand>((id, dto)), cancellationToken);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParticipation(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new DeleteParticipationCommand(id), cancellationToken);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllParticipation(CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new GetAllParticipationQuery(), cancellationToken));
        }
    }
}