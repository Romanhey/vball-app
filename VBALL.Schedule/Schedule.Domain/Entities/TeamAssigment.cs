using System.ComponentModel.DataAnnotations;

namespace Schedule.Domain.Entities
{
    public class TeamAssigment
    {
        [Key]
        public required int TeamAssigmentId {  get; set; }
        public required int ParticipationId {  get; set; }
        public required int TeamId {  get; set; }
    }
}
