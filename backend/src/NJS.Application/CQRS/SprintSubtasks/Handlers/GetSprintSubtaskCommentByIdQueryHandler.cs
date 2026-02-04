using MediatR;
using NJS.Application.CQRS.SprintSubtasks.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintSubtasks.Handlers
{
    public class GetSprintSubtaskCommentByIdQueryHandler : IRequestHandler<GetSprintSubtaskCommentByIdQuery, SprintSubtaskCommentDto?>
    {
        private readonly ProjectManagementContext _context;

        public GetSprintSubtaskCommentByIdQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<SprintSubtaskCommentDto?> Handle(GetSprintSubtaskCommentByIdQuery request, CancellationToken cancellationToken)
        {
            var comment = await _context.SprintSubtaskComments
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(c => c.SubtaskCommentId == request.SubtaskCommentId, cancellationToken);

            if (comment == null)
            {
                return null; // Comment not found
            }

            return new SprintSubtaskCommentDto
            {
                SubtaskCommentId = comment.SubtaskCommentId,
                Taskid = comment.Taskid,
                SubtaskId = comment.SubtaskId,
                CommentText = comment.CommentText,
                CreatedBy = comment.CreatedBy,
                CreatedDate = comment.CreatedDate,
                UpdatedBy = comment.UpdatedBy,
                UpdatedDate = comment.UpdatedDate
            };
        }
    }
}
