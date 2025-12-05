using MediatR;
using NJS.Application.CQRS.SprintTasks.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class GetSprintTaskCommentByIdQueryHandler : IRequestHandler<GetSprintTaskCommentByIdQuery, SprintTaskCommentDto?>
    {
        private readonly ProjectManagementContext _context;

        public GetSprintTaskCommentByIdQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<SprintTaskCommentDto> Handle(GetSprintTaskCommentByIdQuery request, CancellationToken cancellationToken)
        {
            var comment = await _context.SprintTaskComments
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(c => c.CommentId == request.CommentId, cancellationToken);

            if (comment == null)
            {
                return null; // Comment not found
            }

            return new SprintTaskCommentDto
            {
                CommentId = comment.CommentId,
                Taskid = comment.Taskid,
                CommentText = comment.CommentText,
                CreatedBy = comment.CreatedBy,
                CreatedDate = comment.CreatedDate,
                UpdatedBy = comment.UpdatedBy,
                UpdatedDate = comment.UpdatedDate
            };
        }
    }
}
