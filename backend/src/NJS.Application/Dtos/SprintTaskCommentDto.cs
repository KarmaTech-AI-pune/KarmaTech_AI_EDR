using System;

namespace NJS.Application.Dtos
{
    public class SprintTaskCommentDto
    {
        public int Id { get; set; }
        public string? TaskId { get; set; }
        public string? CommentText { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
