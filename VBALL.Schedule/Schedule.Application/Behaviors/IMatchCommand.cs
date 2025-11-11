namespace Schedule.Application.Behaviors
{
    /// <summary>
    /// Marker interface for commands that work with a specific match.
    /// Commands implementing this interface will have match existence validated by pipeline behavior.
    /// </summary>
    public interface IMatchCommand
    {
        int MatchId { get; }
    }
}
