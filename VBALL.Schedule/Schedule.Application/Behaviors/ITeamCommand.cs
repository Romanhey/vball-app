namespace Schedule.Application.Behaviors
{
    /// <summary>
    /// Marker interface for commands that work with a specific team.
    /// Commands implementing this interface will have team existence validated by pipeline behavior.
    /// </summary>
    public interface ITeamCommand
    {
        int TeamId { get; }
    }
}
