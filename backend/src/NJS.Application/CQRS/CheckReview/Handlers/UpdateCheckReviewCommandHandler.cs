using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Application.DTOs;
using NJS.Domain.Database;
using System.Collections.Generic;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class UpdateCheckReviewCommandHandler : IRequestHandler<UpdateCheckReviewCommand, CheckReviewDto>
    {
        private readonly ProjectManagementContext _context;

        public UpdateCheckReviewCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<CheckReviewDto> Handle(UpdateCheckReviewCommand request, CancellationToken cancellationToken)
        {
            var checkReview = await _context.CheckReviews
                .FirstOrDefaultAsync(cr => cr.Id == request.Id, cancellationToken);

            if (checkReview == null)
            {
                throw new KeyNotFoundException($"CheckReview with ID {request.Id} not found");
            }

            // Update properties
            checkReview.ProjectId = request.ProjectId;
            checkReview.ActivityNo = request.ActivityNo;
            checkReview.ActivityName = request.ActivityName;
            checkReview.DocumentNumber = request.DocumentNumber;
            checkReview.DocumentName = request.DocumentName;
            checkReview.Objective = request.Objective;
            checkReview.References = request.References;
            checkReview.FileName = request.FileName;
            checkReview.QualityIssues = request.QualityIssues;
            checkReview.Completion = request.Completion;
            checkReview.CheckedBy = request.CheckedBy;
            checkReview.ApprovedBy = request.ApprovedBy;
            checkReview.ActionTaken = request.ActionTaken;
            checkReview.Maker = request.Maker;
            checkReview.Checker = request.Checker;
            checkReview.UpdatedAt = DateTime.UtcNow;
            checkReview.UpdatedBy = request.UpdatedBy;

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
                UpdatedAt = checkReview.UpdatedAt,
                CreatedBy = checkReview.CreatedBy,
                UpdatedBy = checkReview.UpdatedBy
            };
        }
    }
}
