using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.CheckReview.Queries;
using EDR.Application.DTOs;
using EDR.Domain.Database;
using Microsoft.EntityFrameworkCore;

namespace EDR.Application.CQRS.CheckReview.Handlers
{
    public class GetCheckReviewsByProjectQueryHandler : IRequestHandler<GetCheckReviewsByProjectQuery, IEnumerable<CheckReviewDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetCheckReviewsByProjectQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CheckReviewDto>> Handle(GetCheckReviewsByProjectQuery request, CancellationToken cancellationToken)
        {
            var checkReviews = await _context.CheckReviews
                .AsNoTracking()
                .Where(cr => cr.ProjectId == request.ProjectId)
                .ToListAsync(cancellationToken);

            return checkReviews.Select(checkReview => new CheckReviewDto
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
            }).ToList();
        }
    }
}

