using MediatR;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class UpdateCheckReviewCommandHandler : IRequestHandler<UpdateCheckReviewCommand, CheckReviewDto>
    {
        private readonly ICheckReviewRepository _repository;

        public UpdateCheckReviewCommandHandler(ICheckReviewRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CheckReviewDto> Handle(UpdateCheckReviewCommand request, CancellationToken cancellationToken)
        {
            var existingEntity = await _repository.GetByIdAsync(request.Id);
            if (existingEntity == null)
            {
                throw new KeyNotFoundException($"CheckReview with ID {request.Id} not found.");
            }

            // Update entity properties
            existingEntity.ProjectId = request.ProjectId;
            existingEntity.ActivityNo = request.ActivityNo;
            existingEntity.ActivityName = request.ActivityName;
            existingEntity.Objective = request.Objective;
            existingEntity.References = request.References;
            existingEntity.FileName = request.FileName;
            existingEntity.QualityIssues = request.QualityIssues;
            existingEntity.Completion = request.Completion;
            existingEntity.CheckedBy = request.CheckedBy;
            existingEntity.ApprovedBy = request.ApprovedBy;
            existingEntity.ActionTaken = request.ActionTaken;
            existingEntity.UpdatedBy = request.UpdatedBy;
            existingEntity.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(existingEntity);

            // Return updated entity as DTO
            return new CheckReviewDto
            {
                Id = existingEntity.Id,
                ProjectId = existingEntity.ProjectId,
                ActivityNo = existingEntity.ActivityNo,
                ActivityName = existingEntity.ActivityName,
                Objective = existingEntity.Objective,
                References = existingEntity.References,
                FileName = existingEntity.FileName,
                QualityIssues = existingEntity.QualityIssues,
                Completion = existingEntity.Completion,
                CheckedBy = existingEntity.CheckedBy,
                ApprovedBy = existingEntity.ApprovedBy,
                ActionTaken = existingEntity.ActionTaken,
                CreatedAt = existingEntity.CreatedAt,
                UpdatedAt = existingEntity.UpdatedAt,
                CreatedBy = existingEntity.CreatedBy,
                UpdatedBy = existingEntity.UpdatedBy
            };
        }
    }
}
