namespace Schedule.Application.Behaviors
{
    /// <summary>
    /// Marker interface for commands that modify participation.
    /// Commands implementing this interface will be validated by FinishedMatchValidationBehavior.
    /// </summary>
    public interface IParticipationCommand
    {
        int ParticipationId { get; }
    }
}
