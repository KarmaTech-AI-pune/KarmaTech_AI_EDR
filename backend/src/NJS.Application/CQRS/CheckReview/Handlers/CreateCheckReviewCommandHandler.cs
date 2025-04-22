using MediatR;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class CreateCheckReviewCommandHandler : IRequestHandler<CreateCheckReviewCommand, CheckReviewDto>
    {
        private readonly ICheckReviewRepository _repository;

        public CreateCheckReviewCommandHandler(ICheckReviewRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CheckReviewDto> Handle(CreateCheckReviewCommand request, CancellationToken cancellationToken)
        {
            var entity = new Domain.Entities.CheckReview
            {
                ProjectId = request.ProjectId,
                ActivityNo = request.ActivityNo,
                ActivityName = request.ActivityName,
                Objective = request.Objective,
                References = request.References,
                FileName = request.FileName,
                QualityIssues = request.QualityIssues,
                Completion = request.Completion,
                CheckedBy = request.CheckedBy,
                ApprovedBy = request.ApprovedBy,
                ActionTaken = request.ActionTaken,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            var id = await _repository.AddAsync(entity);

            // Retrieve the created entity to get the generated ID
            var createdEntity = await _repository.GetByIdAsync(id);

            return new CheckReviewDto
            {
                Id = createdEntity.Id,
                ProjectId = createdEntity.ProjectId,
                ActivityNo = createdEntity.ActivityNo,
                ActivityName = createdEntity.ActivityName,
                Objective = createdEntity.Objective,
                References = createdEntity.References,
                FileName = createdEntity.FileName,
                QualityIssues = createdEntity.QualityIssues,
                Completion = createdEntity.Completion,
                CheckedBy = createdEntity.CheckedBy,
                ApprovedBy = createdEntity.ApprovedBy,
                ActionTaken = createdEntity.ActionTaken,
                CreatedAt = createdEntity.CreatedAt,
                CreatedBy = createdEntity.CreatedBy
            };
        }
    }
}
