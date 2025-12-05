using MediatR;
using NJS.Application.CQRS.SprintTasks.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class GetSprintTaskCommentsByTaskIdQueryHandler : IRequestHandler<GetSprintTaskCommentsByTaskIdQuery, List<SprintTaskCommentDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetSprintTaskCommentsByTaskIdQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<SprintTaskCommentDto>> Handle(GetSprintTaskCommentsByTaskIdQuery request, CancellationToken cancellationToken)
        {
            var comments = await _context.SprintTaskComments
                                         .AsNoTracking()
                                         .Where(c => c.Taskid == request.Taskid)
                                         .Select(c => new SprintTaskCommentDto
                                         {
                                             CommentId = c.CommentId,
                                             Taskid = c.Taskid,
                                             CommentText = c.CommentText,
                                             CreatedBy = c.CreatedBy,
                                             CreatedDate = c.CreatedDate,
                                             UpdatedBy = c.UpdatedBy,
                                             UpdatedDate = c.UpdatedDate
                                         })
                                         .ToListAsync(cancellationToken);

            return comments;
        }
    }
}
