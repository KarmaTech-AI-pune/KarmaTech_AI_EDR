using MediatR;
using EDR.Application.CQRS.SprintTasks.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintTasks.Handlers
{
    public class GetSprintTaskCommentsByTaskIdQueryHandler : IRequestHandler<GetSprintTaskCommentsByTaskIdQuery, SprintTaskCommentsWithTotalDto>
    {
        private readonly ProjectManagementContext _context;
        private static readonly Regex LoggedHoursRegex = new(@"logged ([\d.]+)h(?::\s*(.*))?", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly Regex UpdatedTotalRegex = new(@"updated total work to ([\d.]+)h(?::\s*(.*))?", RegexOptions.IgnoreCase | RegexOptions.Compiled);

        public GetSprintTaskCommentsByTaskIdQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<SprintTaskCommentsWithTotalDto> Handle(GetSprintTaskCommentsByTaskIdQuery request, CancellationToken cancellationToken)
        {
            var dbComments = await _context.SprintTaskComments
                                         .AsNoTracking()
                                         .Where(c => c.Taskid == request.Taskid && c.TenantId == (_context.TenantId ?? 0))
                                         .ToListAsync(cancellationToken);

            List<SprintTaskCommentDto> commentDtos = new();
            decimal totalLoggedHours = 0;
            decimal totalWorkedStoryPoints = 0;

            foreach (var c in dbComments)
            {
                var dto = new SprintTaskCommentDto
                {
                    CommentId = c.CommentId,
                    Taskid = c.Taskid,
                    CommentText = c.CommentText,
                    CreatedBy = c.CreatedBy,
                    CreatedDate = c.CreatedDate,
                    UpdatedBy = c.UpdatedBy,
                    UpdatedDate = c.UpdatedDate,
                    WorkedStoryPoint = c.WorkedStoryPoint
                };

                if (c.WorkedStoryPoint.HasValue)
                {
                    totalWorkedStoryPoints += c.WorkedStoryPoint.Value;
                }

                string text = c.CommentText ?? "";
                var loggedMatch = LoggedHoursRegex.Match(text);
                var updatedMatch = UpdatedTotalRegex.Match(text);
                bool commiteMatch = text.Contains("Commite by", StringComparison.OrdinalIgnoreCase);

                if (loggedMatch.Success)
                {
                    if (decimal.TryParse(loggedMatch.Groups[1].Value, out decimal h))
                    {
                        dto.HoursLogged = h;
                        totalLoggedHours += h;
                    }
                    dto.Description = loggedMatch.Groups.Count > 2 ? loggedMatch.Groups[2].Value : "";
                }
                else if (updatedMatch.Success)
                {
                    if (decimal.TryParse(updatedMatch.Groups[1].Value, out decimal h))
                    {
                        dto.HoursLogged = h;
                        // totalLoggedHours += h; // Not clear if this should be added, frontend adds it, let me check. Actually yes, the previous frontend logic was adding 'logged Xh' to sum.
                    }
                    dto.Description = updatedMatch.Groups.Count > 2 ? updatedMatch.Groups[2].Value : "";
                }
                else if (commiteMatch)
                {
                    dto.HoursLogged = 0;
                    var parts = text.Split(':');
                    dto.Description = parts.Length > 1 ? string.Join(":", parts.Skip(1)).Trim() : text;
                }
                else
                {
                    dto.HoursLogged = 0;
                    dto.Description = text;
                }

                commentDtos.Add(dto);
            }

            return new SprintTaskCommentsWithTotalDto
            {
                Comments = commentDtos,
                TotalLoggedHours = totalLoggedHours,
                TotalWorkedStoryPoints = totalWorkedStoryPoints
            };
        }
    }
}

