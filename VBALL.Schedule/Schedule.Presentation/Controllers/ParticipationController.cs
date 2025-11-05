using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Schedule.Application.DTO.Participation;
using Schedule.Application.UseCases.Participation.ApproveParticipation;
using Schedule.Application.UseCases.Participation.ConfirmParticipation;
using Schedule.Application.UseCases.Participation.CreateParticipation;
using Schedule.Application.UseCases.Participation.DeleteParticipation;
using Schedule.Application.UseCases.Participation.GetAllParticipation;
using Schedule.Application.UseCases.Participation.GetParticipation;
using Schedule.Application.UseCases.Participation.GetParticipationByPlayer;
using Schedule.Application.UseCases.Participation.GetParticipationByStatus;
using Schedule.Application.UseCases.Participation.UpdateParticipation;
using Schedule.Application.UseCases.Participation.RequestCancellation;
using Schedule.Application.UseCases.Participation.ApproveCancellation;
using Schedule.Application.UseCases.Participation.RejectCancellation;
using Schedule.Domain.Entities;

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

        [HttpGet("player/{playerId}")]
        public async Task<IActionResult> GetParticipationByPlayer(int playerId, CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new GetParticipationByPlayerQuery(playerId), cancellationToken));
        }

        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetParticipationByStatus(ParticipationStatus status, CancellationToken cancellationToken)
        {
            return Ok(await mediator.Send(new GetParticipationByStatusQuery(status), cancellationToken));
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveParticipation(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new ApproveParticipationCommand(id), cancellationToken);
            return Ok();
        }

        [HttpPost("{id}/confirm")]
        public async Task<IActionResult> ConfirmParticipation(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new ConfirmParticipationCommand(id), cancellationToken);
            return Ok();
        }

        [HttpPost("{id}/request-cancellation")]
        public async Task<IActionResult> RequestCancellation(int id, [FromBody] RequestCancellationDTO dto, CancellationToken cancellationToken)
        {
            await mediator.Send(new RequestCancellationCommand(id, dto), cancellationToken);
            return Ok();
        }

        [HttpPost("{id}/approve-cancellation")]
        public async Task<IActionResult> ApproveCancellation(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new ApproveCancellationCommand(id), cancellationToken);
            return Ok();
        }

        [HttpPost("{id}/reject-cancellation")]
        public async Task<IActionResult> RejectCancellation(int id, CancellationToken cancellationToken)
        {
            await mediator.Send(new RejectCancellationCommand(id), cancellationToken);
            return Ok();
        }
    }
}