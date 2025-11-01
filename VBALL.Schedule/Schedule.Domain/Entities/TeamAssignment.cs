using System.ComponentModel.DataAnnotations;

namespace Schedule.Domain.Entities
{
    public class TeamAssignment
    {
        [Key]
        public required int TeamAssignmentId {  get; set; }
        public required int ParticipationId {  get; set; }
        public required int TeamId {  get; set; }
    }
}
