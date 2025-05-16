using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Application.DTOs;
using NJS.Domain.Database;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class CreateCheckReviewCommandHandler : IRequestHandler<CreateCheckReviewCommand, CheckReviewDto>
    {
        private readonly ProjectManagementContext _context;

        public CreateCheckReviewCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<CheckReviewDto> Handle(CreateCheckReviewCommand request, CancellationToken cancellationToken)
        {
            var checkReview = new NJS.Domain.Entities.CheckReview
            {
                ProjectId = request.ProjectId,
                ActivityNo = request.ActivityNo,
                ActivityName = request.ActivityName,
                DocumentNumber = request.DocumentNumber,
                DocumentName = request.DocumentName,
                Objective = request.Objective,
                References = request.References,
                FileName = request.FileName,
                QualityIssues = request.QualityIssues,
                Completion = request.Completion ?? "N",
                CheckedBy = request.CheckedBy,
                ApprovedBy = request.ApprovedBy,
                ActionTaken = request.ActionTaken,
                Maker = request.Maker,
                Checker = request.Checker,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.CreatedBy
            };

            await _context.CheckReviews.AddAsync(checkReview, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            // Manual mapping to DTO
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
                CreatedBy = checkReview.CreatedBy
            };
        }
    }
}
