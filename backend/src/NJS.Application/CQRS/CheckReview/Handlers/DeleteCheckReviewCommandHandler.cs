using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Application.CQRS.CheckReview.Notifications;
using NJS.Domain.Database;
using NJS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore.Storage;
using NJS.Application.Services.IContract;
using System.Collections.Generic;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class DeleteCheckReviewCommandHandler : IRequestHandler<DeleteCheckReviewCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly IMediator _mediator;
        private readonly ILogger<DeleteCheckReviewCommandHandler> _logger;
        private readonly ICurrentUserService _currentUserService;

        public DeleteCheckReviewCommandHandler(ProjectManagementContext context, IMediator mediator, ILogger<DeleteCheckReviewCommandHandler> logger, ICurrentUserService currentUserService)
        {
            _context = context;
            _mediator = mediator;
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(DeleteCheckReviewCommand request, CancellationToken cancellationToken)
        {
            IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();

            bool result = false;
            NJS.Domain.Entities.CheckReview deletedCheckReview = null;

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
                            result = false;
                            return;
                        }

                        _context.CheckReviews.Remove(checkReview);
                        await _context.SaveChangesAsync(cancellationToken);

                        deletedCheckReview = checkReview; // Assign to the outer variable
                        result = true;
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

            if (result && deletedCheckReview != null)
            {
                // Retrieve Maker, Checker, and CreatedBy user details for email notification
                var makerUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == deletedCheckReview.Maker, cancellationToken);
                var checkerUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == deletedCheckReview.Checker, cancellationToken);
                // For deletion, we might not have an "UpdatedBy" or "CreatedBy" from the request,
                // so we'll use the current user or a fallback.
                var actionByName = _currentUserService.UserName ?? "System";

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

                if (!string.IsNullOrEmpty(recipientEmailString))
                {
                    await _mediator.Publish(new CheckReviewStatusEmailNotification(
                        deletedCheckReview,
                        actionByName,
                        "Check Review deleted.", // Comments for deletion
                        recipientEmailString,
                        PMWorkflowStatusEnum.ReviewChanges // Using ReviewChanges for deletion status
                    ), cancellationToken);
                }
            }

            return result;
        }
    }
}
