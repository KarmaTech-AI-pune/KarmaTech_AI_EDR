using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Application.CQRS.CheckReview.Notifications;
using NJS.Application.DTOs;
using NJS.Domain.Database;
using NJS.Domain.Enums; // For PMWorkflowStatusEnum
using Microsoft.EntityFrameworkCore; // For .Include() and .FirstOrDefaultAsync()
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore.Storage; // For IExecutionStrategy

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class CreateCheckReviewCommandHandler : IRequestHandler<CreateCheckReviewCommand, CheckReviewDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly IMediator _mediator;
        private readonly ILogger<CreateCheckReviewCommandHandler> _logger;

        public CreateCheckReviewCommandHandler(ProjectManagementContext context, IMediator mediator, ILogger<CreateCheckReviewCommandHandler> logger)
        {
            _context = context;
            _mediator = mediator;
            _logger = logger;
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

            // Use DbContext.Database.CreateExecutionStrategy() for retriable transactions
            IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();

            await strategy.ExecuteAsync(async () =>
            {
                using (var transaction = _context.Database.BeginTransaction())
                {
                    try
                    {
                        // Validate required fields before saving
                        if (string.IsNullOrEmpty(checkReview.ActivityName))
                            throw new ArgumentException("Activity name is required");

                        if (checkReview.ProjectId <= 0)
                            throw new ArgumentException("Valid project ID is required");

                        await _context.CheckReviews.AddAsync(checkReview, cancellationToken);
                        await _context.SaveChangesAsync(cancellationToken);

                        // Commit transaction if successful
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

            // Retrieve Maker, Checker, and CreatedBy user details for email notification
            var makerUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == checkReview.Maker, cancellationToken);
            var checkerUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == checkReview.Checker, cancellationToken);
            var createdByUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.CreatedBy, cancellationToken);

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
            
            // Determine the actionBy name for the email content
            var actionByName = createdByUser?.UserName ?? request.CreatedBy; // Use UserName if available, otherwise fallback to ID

            // Publish notification for email functionality
            if (!string.IsNullOrEmpty(recipientEmailString))
            {
                await _mediator.Publish(new CheckReviewStatusEmailNotification(
                    checkReview,
                    actionByName, // ActionBy - now user's name
                    request.ActionTaken ?? string.Empty, // Comments - using ActionTaken as comments, ensure not null
                    recipientEmailString, // Dynamic RecipientEmail
                    PMWorkflowStatusEnum.Initial // NewStatus for creation
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
                DocumentName = request.DocumentName,
                Objective = request.Objective,
                References = request.References,
                FileName = request.FileName,
                QualityIssues = request.QualityIssues,
                Completion = request.Completion,
                CheckedBy = request.CheckedBy,
                ApprovedBy = request.ApprovedBy,
                ActionTaken = request.ActionTaken,
                Maker = request.Maker,
                Checker = request.Checker,
                CreatedAt = checkReview.CreatedAt,
                CreatedBy = request.CreatedBy
            };
        }
    }
}
