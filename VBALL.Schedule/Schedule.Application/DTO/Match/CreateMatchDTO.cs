using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Schedule.Application.DTO.Match
{
    public record CreateMatchDTO(DateTime StartTime, int TeamAId, int TeamBId);
}
