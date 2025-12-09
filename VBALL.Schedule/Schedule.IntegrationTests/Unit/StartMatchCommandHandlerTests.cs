using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Schedule.Application.UseCases.Match.UpdateMatch;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;
using Xunit;
using MatchEntity = Schedule.Domain.Entities.Match;

namespace Schedule.IntegrationTests.Unit;

public class StartMatchCommandHandlerTests
{
    [Fact]
    public async Task Throws_when_not_enough_confirmed_players()
    {
        var uow = new Mock<IUnitOfWork>();
        var matchRepo = new Mock<IMatchRepository>();
        var participationRepo = new Mock<IParticipationRepository>();

        uow.SetupGet(x => x.MatchRepository).Returns(matchRepo.Object);
        uow.SetupGet(x => x.ParticipationRepository).Returns(participationRepo.Object);

        var match = new MatchEntity
        {
            MatchId = 1,
            StartTime = DateTime.UtcNow.AddDays(1),
            TeamAId = 1,
            TeamBId = 2,
            Status = MatchStatus.Scheduled
        };

        matchRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(match);
        participationRepo.Setup(r => r.GetActiveParticipationCountForMatchAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(10);

        var handler = new StartMatchCommandHandler(uow.Object);

        await FluentActions.Invoking(() => handler.Handle(new StartMatchCommand(1), CancellationToken.None))
            .Should().ThrowAsync<Schedule.Application.Exceptions.BadRequestException>()
            .WithMessage("*requires exactly*");
    }

    [Fact]
    public async Task Sets_match_in_progress_when_enough_players()
    {
        var uow = new Mock<IUnitOfWork>();
        var matchRepo = new Mock<IMatchRepository>();
        var participationRepo = new Mock<IParticipationRepository>();

        uow.SetupGet(x => x.MatchRepository).Returns(matchRepo.Object);
        uow.SetupGet(x => x.ParticipationRepository).Returns(participationRepo.Object);

        var match = new MatchEntity
        {
            MatchId = 2,
            StartTime = DateTime.UtcNow.AddDays(1),
            TeamAId = 1,
            TeamBId = 2,
            Status = MatchStatus.Scheduled
        };

        matchRepo.Setup(r => r.GetByIdAsync(2, It.IsAny<CancellationToken>())).ReturnsAsync(match);
        participationRepo.Setup(r => r.GetActiveParticipationCountForMatchAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Schedule.Domain.Constants.ScheduleConstants.MaxPlayersPerMatch);
        participationRepo.Setup(r => r.GetByMatchAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Participation>());

        var handler = new StartMatchCommandHandler(uow.Object);

        await handler.Handle(new StartMatchCommand(2), CancellationToken.None);

        match.Status.Should().Be(MatchStatus.InProgress);
        matchRepo.Verify(r => r.UpdateAsync(match, It.IsAny<CancellationToken>()), Times.Once);
        uow.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

