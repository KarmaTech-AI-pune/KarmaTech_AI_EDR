using MediatR;
using EDR.Application.CQRS.SprintSubtasks.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintSubtasks.Handlers
{
    public class GetSprintSubtaskCommentsBySubtaskIdQueryHandler : IRequestHandler<GetSprintSubtaskCommentsBySubtaskIdQuery, List<SprintSubtaskCommentDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetSprintSubtaskCommentsBySubtaskIdQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<SprintSubtaskCommentDto>> Handle(GetSprintSubtaskCommentsBySubtaskIdQuery request, CancellationToken cancellationToken)
        {
            var comments = await _context.SprintSubtaskComments
                                         .AsNoTracking()
                                         .Where(c => c.SubtaskId == request.SubtaskId && c.TenantId == (_context.TenantId ?? 0))
                                         .Select(c => new SprintSubtaskCommentDto
                                         {
                                             SubtaskCommentId = c.SubtaskCommentId,
                                             Taskid = c.Taskid,
                                             SubtaskId = c.SubtaskId,
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

