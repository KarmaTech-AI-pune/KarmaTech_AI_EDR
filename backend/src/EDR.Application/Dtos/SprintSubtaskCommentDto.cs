using System;

namespace EDR.Application.Dtos
{
    public class SprintSubtaskCommentDto
    {
        public int SubtaskCommentId { get; set; }
        public int Taskid { get; set; }
        public int? SubtaskId { get; set; }
        public string? CommentText { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}

