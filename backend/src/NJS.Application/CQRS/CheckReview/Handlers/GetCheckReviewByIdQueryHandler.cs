using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.CheckReview.Queries;
using NJS.Application.DTOs;
using NJS.Domain.Database;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class GetCheckReviewByIdQueryHandler : IRequestHandler<GetCheckReviewByIdQuery, CheckReviewDto>
    {
        private readonly ProjectManagementContext _context;

        public GetCheckReviewByIdQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<CheckReviewDto> Handle(GetCheckReviewByIdQuery request, CancellationToken cancellationToken)
        {
            var checkReview = await _context.CheckReviews
                .FirstOrDefaultAsync(cr => cr.Id == request.Id, cancellationToken);

            if (checkReview == null)
            {
                return null;
            }

            return new CheckReviewDto
            {
                Id = checkReview.Id,
                ProjectId = checkReview.ProjectId,
                ActivityNo = checkReview.ActivityNo,
                ActivityName = checkReview.ActivityName,
                DocumentNumber = checkReview.DocumentNumber,
                DocumentName = checkReview.DocumentName,
                Objective = checkReview.Objective,
                References = checkReview.References,
                FileName = checkReview.FileName,
                QualityIssues = checkReview.QualityIssues,
                Completion = checkReview.Completion,
                CheckedBy = checkReview.CheckedBy,
                ApprovedBy = checkReview.ApprovedBy,
                ActionTaken = checkReview.ActionTaken,
                Maker = checkReview.Maker,
                Checker = checkReview.Checker,
                CreatedAt = checkReview.CreatedAt,
                UpdatedAt = checkReview.UpdatedAt,
                CreatedBy = checkReview.CreatedBy,
                UpdatedBy = checkReview.UpdatedBy
            };
        }
    }
}
