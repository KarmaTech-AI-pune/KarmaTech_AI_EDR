using System;

namespace EDR.Application.Dtos
{
    public class SprintTaskCommentDto
    {
        public int CommentId { get; set; }
        public int Taskid { get; set; } // Changed to Taskid to match entity
        public string? CommentText { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; } // Made nullable
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public decimal HoursLogged { get; set; }
        public string? Description { get; set; }
        public decimal? WorkedStoryPoint { get; set; }
    }
}

