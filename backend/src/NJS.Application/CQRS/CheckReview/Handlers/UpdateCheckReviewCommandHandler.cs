using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Application.CQRS.CheckReview.Notifications;
using NJS.Application.DTOs;
using NJS.Domain.Database;
using NJS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore.Storage;
using NJS.Application.Services.IContract;
using System.Collections.Generic;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class UpdateCheckReviewCommandHandler : IRequestHandler<UpdateCheckReviewCommand, CheckReviewDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly IMediator _mediator;
        private readonly ILogger<UpdateCheckReviewCommandHandler> _logger;
        private readonly ICurrentUserService _currentUserService;

        public UpdateCheckReviewCommandHandler(ProjectManagementContext context, IMediator mediator, ILogger<UpdateCheckReviewCommandHandler> logger, ICurrentUserService currentUserService)
        {
            _context = context;
            _mediator = mediator;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<CheckReviewDto> Handle(UpdateCheckReviewCommand request, CancellationToken cancellationToken)
        {
            IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();

            NJS.Domain.Entities.CheckReview updatedCheckReview = null;

            await strategy.ExecuteAsync(async () =>
            {
                using (var transaction = _context.Database.BeginTransaction())
                {
                    try
                    {
                        var checkReview = await _context.CheckReviews
                            .FirstOrDefaultAsync(cr => cr.Id == request.Id, cancellationToken);

                        if (checkReview == null)
                        {
                            throw new KeyNotFoundException($"CheckReview with ID {request.Id} not found.");
                        }

                        // Update properties from the request
                        checkReview.ProjectId = request.ProjectId;
                        checkReview.ActivityNo = request.ActivityNo;
                        checkReview.ActivityName = request.ActivityName;
                        checkReview.DocumentNumber = request.DocumentNumber;
                        checkReview.DocumentName = request.DocumentName;
                        checkReview.Objective = request.Objective;
                        checkReview.References = request.References;
                        checkReview.FileName = request.FileName;
                        checkReview.QualityIssues = request.QualityIssues;
                        checkReview.Completion = request.Completion ?? "N"; // Default to "N" if null
                        checkReview.CheckedBy = request.CheckedBy;
                        checkReview.ApprovedBy = request.ApprovedBy;
                        checkReview.ActionTaken = request.ActionTaken;
                        checkReview.Maker = request.Maker;
                        checkReview.Checker = request.Checker;
                        checkReview.UpdatedAt = DateTime.UtcNow;
                        checkReview.UpdatedBy = request.UpdatedBy ?? "System";

                        _context.CheckReviews.Update(checkReview);
                        await _context.SaveChangesAsync(cancellationToken);

                        updatedCheckReview = checkReview; // Assign to the outer variable
                        transaction.Commit();
                    }
                    catch (DbUpdateException ex)
                    {
                        transaction.Rollback();
                        _logger.LogError($"Database update error: {ex.InnerException?.Message}");
                        throw;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        _logger.LogError($"Generic error: {ex.Message}");
                        throw;
                    }
                }
            });

            if (updatedCheckReview == null)
            {
                throw new InvalidOperationException("Check review update failed and returned null.");
            }

            // Retrieve Maker, Checker, and UpdatedBy user details for email notification
            var makerUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == updatedCheckReview.Maker, cancellationToken);
            var checkerUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == updatedCheckReview.Checker, cancellationToken);
            var updatedByUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.UpdatedBy, cancellationToken);

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

            var actionByName = _currentUserService.UserName ?? updatedByUser?.UserName ?? request.UpdatedBy;

            if (!string.IsNullOrEmpty(recipientEmailString))
            {
                await _mediator.Publish(new CheckReviewStatusEmailNotification(
                    updatedCheckReview,
                    actionByName,
                    request.ActionTaken ?? string.Empty,
                    recipientEmailString,
                    PMWorkflowStatusEnum.ReviewChanges // NewStatus for update
                ), cancellationToken);
            }

            return new CheckReviewDto
            {
                Id = updatedCheckReview.Id,
                ProjectId = updatedCheckReview.ProjectId,
                ActivityNo = updatedCheckReview.ActivityNo,
                ActivityName = updatedCheckReview.ActivityName,
                DocumentNumber = updatedCheckReview.DocumentNumber,
                DocumentName = updatedCheckReview.DocumentName,
                Objective = updatedCheckReview.Objective,
                References = updatedCheckReview.References,
                FileName = updatedCheckReview.FileName,
                QualityIssues = updatedCheckReview.QualityIssues,
                Completion = updatedCheckReview.Completion,
                CheckedBy = updatedCheckReview.CheckedBy,
                ApprovedBy = updatedCheckReview.ApprovedBy,
                ActionTaken = updatedCheckReview.ActionTaken,
                Maker = updatedCheckReview.Maker,
                Checker = updatedCheckReview.Checker,
                CreatedAt = updatedCheckReview.CreatedAt,
                UpdatedAt = updatedCheckReview.UpdatedAt,
                CreatedBy = updatedCheckReview.CreatedBy,
                UpdatedBy = updatedCheckReview.UpdatedBy
            };
        }
    }
}
