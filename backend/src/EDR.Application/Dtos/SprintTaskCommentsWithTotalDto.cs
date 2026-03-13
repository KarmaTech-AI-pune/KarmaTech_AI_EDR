using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class SprintTaskCommentsWithTotalDto
    {
        public List<SprintTaskCommentDto> Comments { get; set; } = new();
        public decimal TotalLoggedHours { get; set; } = 0;
        public decimal TotalWorkedStoryPoints { get; set; } = 0;
    }
}
