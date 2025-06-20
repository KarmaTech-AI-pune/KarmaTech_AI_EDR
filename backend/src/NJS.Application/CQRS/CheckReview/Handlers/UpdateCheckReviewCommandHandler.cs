using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Application.DTOs;
using NJS.Domain.Database;
using System.Collections.Generic;
using NJS.Application.Services.IContract; // For ICurrentUserService
using NJS.Application.CQRS.CheckReview.Notifications; // For CheckReviewStatusEmailNotification
using NJS.Domain.Enums; // For PMWorkflowStatusEnum

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class UpdateCheckReviewCommandHandler : IRequestHandler<UpdateCheckReviewCommand, CheckReviewDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly IMediator _mediator; // Inject IMediator
        private readonly ICurrentUserService _currentUserService; // Inject ICurrentUserService

        public UpdateCheckReviewCommandHandler(ProjectManagementContext context, IMediator mediator, ICurrentUserService currentUserService)
        {
            _context = context;
            _mediator = mediator;
            _currentUserService = currentUserService;
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

            // Retrieve Maker and Checker user details for email notification
            var makerUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == checkReview.Maker, cancellationToken);
            var checkerUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == checkReview.Checker, cancellationToken);

            var recipientEmails = new List<string>();
            if (makerUser != null && !string.IsNullOrEmpty(makerUser.Email))
            {
                recipientEmails.Add(makerUser.Email);
            }
            if (checkerUser != null && !string.IsNullOrEmpty(checkerUser.Email))
            {
                recipientEmails.Add(checkerUser.Email);
            }

            var recipientEmailString = string.Join(",", recipientEmails);

            // Determine the actionBy name for the email content using CurrentUserService
            var actionByName = _currentUserService.UserName ?? request.UpdatedBy; // Prefer current user, then fallback to UpdatedBy ID

            // Publish notification for email functionality if recipients exist
            if (!string.IsNullOrEmpty(recipientEmailString))
            {
                await _mediator.Publish(new CheckReviewStatusEmailNotification(
                    checkReview,
                    actionByName, // ActionBy - now user's name from CurrentUserService
                    request.ActionTaken ?? string.Empty, // Comments - using ActionTaken as comments, ensure not null
                    recipientEmailString, // Dynamic RecipientEmail
                    PMWorkflowStatusEnum.Initial // NewStatus for update, using Initial as a generic update status
                ), cancellationToken);
            }

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
